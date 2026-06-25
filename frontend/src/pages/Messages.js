import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messagesAPI } from '../utils/api';
import { useUser } from '../hooks/useUser';
import { AuthNavbar } from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { format } from 'date-fns';

export default function Messages() {
  const { dbUser } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const listingId = searchParams.get('listing');
  const otherUserId = searchParams.get('user');

  const loadConversations = useCallback(() => {
    setLoading(true);
    messagesAPI.conversations().then(({ data }) => setConversations(data.conversations)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadThread = useCallback(() => {
    if (!listingId || !otherUserId) return;
    setThreadLoading(true);
    messagesAPI.thread(listingId, otherUserId)
      .then(({ data }) => setThread(data.messages))
      .catch(() => {})
      .finally(() => setThreadLoading(false));
  }, [listingId, otherUserId]);

  useEffect(() => { loadThread(); }, [loadThread]);

  const selectConversation = (c) => {
    setSearchParams({ listing: c.listing.id, user: c.other_user.id });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await messagesAPI.send({ listing_id: listingId, recipient_id: otherUserId, body: body.trim() });
      setBody('');
      loadThread();
      loadConversations();
    } catch {} finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Messages</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card padding={false} className="md:col-span-1 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-gray-400 p-6 text-center">No conversations yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                {conversations.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => selectConversation(c)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${listingId === c.listing.id && otherUserId === c.other_user.id ? 'bg-teal-50' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm text-gray-900">{c.other_user.full_name}</p>
                      {c.unread && <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.listing.vehicle_year} {c.listing.vehicle_make} {c.listing.vehicle_model}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{c.last_message}</p>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card padding={false} className="md:col-span-2 flex flex-col h-[60vh]">
            {!listingId || !otherUserId ? (
              <EmptyState title="Select a conversation" description="Pick a conversation on the left to view messages." />
            ) : threadLoading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {thread.map((m) => (
                    <div key={m.id} className={`max-w-xs ${m.sender_id === dbUser?.id ? 'ml-auto text-right' : ''}`}>
                      <div className={`inline-block px-3 py-2 rounded-lg text-sm ${m.sender_id === dbUser?.id ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        {m.body}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(m.created_at), 'MMM d, h:mm a')}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="border-t border-gray-100 p-3 flex gap-2">
                  <input
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type a message…"
                    className="input flex-1"
                  />
                  <Button type="submit" loading={sending} disabled={!body.trim()}>Send</Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
