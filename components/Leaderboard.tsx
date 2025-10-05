"use client";
import { useEffect, useState } from 'react';

interface Item {
  track_id: string;
  plays: number;
  likes: number;
  downloads: number;
  earnings: number;
  tracks?: { prompt?: string | null; audio_url?: string | null; user_id?: string | null };
}

export default function Leaderboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'plays' | 'likes' | 'earnings'>('plays');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/track-stats?sort=${sort}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load leaderboard');
        setItems(json.items || []);
      } catch (e:any) {
        setError(e?.message || 'Error loading leaderboard');
        console.error('Leaderboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [sort]);

  return (
    <div className="rounded-2xl border border-gold/20 bg-black/40 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Top Tracks</h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
        >
          <option value="plays">Most Played</option>
          <option value="likes">Most Liked</option>
          <option value="earnings">Top Earnings</option>
        </select>
      </div>
      {loading ? (
        <div className="text-white/60">Loading leaderboard…</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-white/60 text-sm">
                <th className="py-2 pr-4">Rank</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Artist</th>
                <th className="py-2 pr-4">Plays</th>
                <th className="py-2 pr-4">Likes</th>
                <th className="py-2 pr-4">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const rank = idx + 1;
                const tier = rank === 1 ? 'from-[#d4af37] to-[#a67c00]' : rank === 2 ? 'from-[#c0c0c0] to-[#9e9e9e]' : rank === 3 ? 'from-[#cd7f32] to-[#a65e2e]' : null;
                return (
                  <tr key={it.track_id} className="border-t border-white/10">
                    <td className="py-3 pr-4">
                      {tier ? (
                        <span className={`inline-block px-2 py-1 rounded-md bg-gradient-to-br ${tier} text-black font-semibold`}>{rank}</span>
                      ) : (
                        <span className="text-white/80">{rank}</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-white">{it.tracks?.prompt || 'Untitled'}</td>
                    <td className="py-3 pr-4 text-white/70">{it.tracks?.user_id || 'Unknown'}</td>
                    <td className="py-3 pr-4 text-white">{it.plays ?? 0}</td>
                    <td className="py-3 pr-4 text-white">{it.likes ?? 0}</td>
                    <td className="py-3 pr-4 text-gold font-semibold">${Number(it.earnings || 0).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
