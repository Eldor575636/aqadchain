const docusign = require('docusign-esign');
const fs = require('fs');

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const apiClient = new docusign.ApiClient();
  apiClient.setOAuthBasePath(process.env.AUTH0_DOMAIN ? 'account-d.docusign.com' : 'account.docusign.com');

  const privateKey = process.env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n');

  const results = await apiClient.requestJWTUserToken(
    process.env.DOCUSIGN_INTEGRATION_KEY,
    process.env.DOCUSIGN_USER_ID,
    ['signature', 'impersonation'],
    Buffer.from(privateKey),
    3600
  );

  cachedToken = results.body.access_token;
  tokenExpiry = Date.now() + (results.body.expires_in - 60) * 1000;
  return cachedToken;
}

function getApiClient(accessToken) {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(process.env.DOCUSIGN_BASE_URL);
  apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
  return apiClient;
}

/**
 * Send a contract envelope to seller and buyer for signature.
 * contractHtml: the rendered HTML of the contract document
 */
async function sendEnvelopeForSignature({ contractHtml, contractNumber, sellerName, sellerEmail, buyerName, buyerEmail }) {
  const accessToken = await getAccessToken();
  const apiClient = getApiClient(accessToken);
  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  // Convert HTML to base64 document
  const docBase64 = Buffer.from(contractHtml).toString('base64');

  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = `Please sign your AqadChain contract: ${contractNumber}`;
  envelopeDefinition.emailBlurb = 'Your Halal vehicle financing contract is ready for signature. Please review and sign at your earliest convenience.';

  // Document
  const doc = new docusign.Document();
  doc.documentBase64 = docBase64;
  doc.name = `AqadChain Contract ${contractNumber}`;
  doc.fileExtension = 'html';
  doc.documentId = '1';
  envelopeDefinition.documents = [doc];

  // Seller signer (recipient 1)
  const seller = docusign.Signer.constructFromObject({
    email: sellerEmail,
    name: sellerName,
    recipientId: '1',
    routingOrder: '1',
    tabs: {
      signHereTabs: [
        docusign.SignHere.constructFromObject({
          anchorString: '**seller_signature**',
          anchorUnits: 'pixels',
          anchorXOffset: '0',
          anchorYOffset: '0',
        }),
      ],
      dateSignedTabs: [
        docusign.DateSigned.constructFromObject({
          anchorString: '**seller_date**',
          anchorUnits: 'pixels',
        }),
      ],
    },
  });

  // Buyer signer (recipient 2, after seller)
  const buyer = docusign.Signer.constructFromObject({
    email: buyerEmail,
    name: buyerName,
    recipientId: '2',
    routingOrder: '2',
    tabs: {
      signHereTabs: [
        docusign.SignHere.constructFromObject({
          anchorString: '**buyer_signature**',
          anchorUnits: 'pixels',
          anchorXOffset: '0',
          anchorYOffset: '0',
        }),
      ],
      dateSignedTabs: [
        docusign.DateSigned.constructFromObject({
          anchorString: '**buyer_date**',
          anchorUnits: 'pixels',
        }),
      ],
    },
  });

  envelopeDefinition.recipients = docusign.Recipients.constructFromObject({
    signers: [seller, buyer],
  });

  envelopeDefinition.status = 'sent';

  const results = await envelopesApi.createEnvelope(process.env.DOCUSIGN_ACCOUNT_ID, {
    envelopeDefinition,
  });

  return results.envelopeId;
}

/**
 * Get the current status of an envelope and recipient signing status.
 */
async function getEnvelopeStatus(envelopeId) {
  const accessToken = await getAccessToken();
  const apiClient = getApiClient(accessToken);
  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  const [envelope, recipients] = await Promise.all([
    envelopesApi.getEnvelope(process.env.DOCUSIGN_ACCOUNT_ID, envelopeId),
    envelopesApi.listRecipients(process.env.DOCUSIGN_ACCOUNT_ID, envelopeId),
  ]);

  return { envelope, recipients };
}

/**
 * Download the signed document as a PDF buffer.
 */
async function downloadSignedDocument(envelopeId) {
  const accessToken = await getAccessToken();
  const apiClient = getApiClient(accessToken);
  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  const pdfBuffer = await envelopesApi.getDocument(
    process.env.DOCUSIGN_ACCOUNT_ID,
    envelopeId,
    'combined'
  );

  return pdfBuffer;
}

/**
 * Resend envelope to all pending recipients.
 */
async function resendEnvelope(envelopeId) {
  const accessToken = await getAccessToken();
  const apiClient = getApiClient(accessToken);
  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  await envelopesApi.update(process.env.DOCUSIGN_ACCOUNT_ID, envelopeId, {
    envelope: { resendEnvelope: 'true' },
  });
}

module.exports = { sendEnvelopeForSignature, getEnvelopeStatus, downloadSignedDocument, resendEnvelope };
