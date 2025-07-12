import React, { useState, useEffect } from "react";
import AnimeCommentCard from "./anime-comment-card";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE_URL } from "@/config";

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Comment {
  id: string;
  user: User;
  body: string;
  created_at: string;
  likes?: number;
  dislikes?: number;
  replies?: Comment[];
}

interface AnimeCommentSectionProps {
  comments?: Comment[];
  isLoading?: boolean;
  commentableType: string; // наприклад: "App\Models\Anime"
  commentableId: string;   // ID об’єкта, до якого коментар
  userToken: string;       // токен користувача для авторизації
}

const mockUser = {
  avatarUrl: "/assets/mock-user-logo.png",
  username: "Ви",
};

const AnimeCommentSection: React.FC<AnimeCommentSectionProps> = ({
  comments: initialComments,
  isLoading = false,
  commentableType,
  commentableId,
  userToken,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments ?? []);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string;
    parentId?: string;
  } | null>(null);
  const [replyText, setReplyText] = useState("");

  // Функція для створення коментаря на бекенді
  async function postComment(body: string) {
    const res = await fetch(`${API_BASE_URL}comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        commentable_type: commentableType,
        commentable_id: commentableId,
        body,
      }),
    });

    if (!res.ok) {
      throw new Error("Не вдалося додати коментар");
    }

    return res.json();
  }

  // Функція для створення відповіді (поки без підтримки parent_id)
  async function postReply(body: string, parentId: string) {
    // Якщо хочеш підтримати вкладені відповіді, треба додати поле parent_id у бекенд
    const res = await fetch(`${API_BASE_URL}comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        commentable_type: commentableType,
        commentable_id: commentableId,
        body,
        parent_id: parentId, // Якщо бекенд це підтримує
      }),
    });

    if (!res.ok) {
      throw new Error("Не вдалося додати відповідь");
    }

    return res.json();
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const data = await postComment(newComment.trim());

      setComments((prev) => [
        ...prev,
        {
          id: data.comment.id,
          user: {
            id: "mock-user",
            name: mockUser.username,
            avatar: mockUser.avatarUrl,
          },
          body: newComment,
          created_at: "щойно",
          likes: 0,
          dislikes: 0,
          replies: [],
        },
      ]);
      setNewComment("");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleAddReply = async (id: string, parentId?: string) => {
    if (!replyText.trim()) return;

    try {
      // Використовуємо або id як parentId, або передаємо parentId, якщо є
      const replyParentId = parentId || id;
      const data = await postReply(replyText.trim(), replyParentId);

      const newReply: Comment = {
        id: data.comment.id,
        user: {
          id: "mock-user",
          name: mockUser.username,
          avatar: mockUser.avatarUrl,
        },
        body: replyText,
        created_at: "щойно",
        likes: 0,
        dislikes: 0,
        replies: [],
      };

      setComments((prev) =>
        prev.map((c) => {
          if (parentId) {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).map((r) =>
                  r.id === id
                    ? { ...r, replies: [...(r.replies || []), newReply] }
                    : r
                ),
              };
            }
          } else if (c.id === id) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        })
      );

      setReplyTo(null);
      setReplyText("");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleLike = (id: string, parentId?: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (parentId && c.id === parentId) {
          return {
            ...c,
            replies: (c.replies || []).map((r) =>
              r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r
            ),
          };
        } else if (c.id === id) {
          return { ...c, likes: (c.likes || 0) + 1 };
        }
        return c;
      })
    );
  };

  const handleDislike = (id: string, parentId?: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (parentId && c.id === parentId) {
          return {
            ...c,
            replies: (c.replies || []).map((r) =>
              r.id === id ? { ...r, dislikes: (r.dislikes || 0) + 1 } : r
            ),
          };
        } else if (c.id === id) {
          return { ...c, dislikes: (c.dislikes || 0) + 1 };
        }
        return c;
      })
    );
  };

  return (
    <div className="mt-4 max-w-2xl mx-auto w-full">
      {isLoading ? (
        <>
          <Skeleton height={32} width={220} className="mb-6" />
          <div className="bg-[#18191C] border border-[#23242A] rounded-2xl p-6 mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} height={32} width={32} />
                ))}
              </div>
              <Skeleton height={1} width={400} className="mb-2" />
              <Skeleton height={60} width={400} className="mb-2" />
              <div className="flex justify-end">
                <Skeleton height={36} width={120} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <AnimeCommentCard
                key={i}
                isLoading
                avatarUrl=""
                username=""
                timeAgo=""
                text=""
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
            Обговорення{" "}
            <span className="text-[#B6B6B6] text-xl">({comments.length})</span>
          </h2>
          <div className="bg-[#18191C] border border-[#23242A] rounded-2xl p-6 mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                {["+","B","i","🙂","📎"].map((sym, i) => (
                  <button key={i} className="w-8 h-8 flex items-center justify-center rounded-md bg-[#23242A] text-white font-bold">
                    {sym}
                  </button>
                ))}
              </div>
              <div className="w-full border-t border-[#888] mb-0" />
              <textarea
                className="bg-[#111113] text-white rounded-2xl border border-[#888] p-5 min-h-[60px] resize-none focus:outline-none focus:border-[#888] mb-2 transition-colors placeholder:text-[#888] text-sm w-full"
                placeholder="Напишіть повідомлення..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  className="px-6 py-2 rounded-lg bg-[#23242A] text-white text-base font-semibold border border-[#44454A] hover:bg-[#33344A] transition"
                  onClick={handleAddComment}
                >
                  Відправити
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {comments.length === 0 ? (
              <div className="text-white text-lg">Коментарів поки немає 😔</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id}>
                  <AnimeCommentCard
                    avatarUrl={comment.user.avatar}
                    username={comment.user.name}
                    timeAgo={comment.created_at}
                    text={comment.body}
                    likes={comment.likes || 0}
                    dislikes={comment.dislikes || 0}
                    onLike={() => handleLike(comment.id)}
                    onDislike={() => handleDislike(comment.id)}
                    onReply={() => setReplyTo({ id: comment.id })}
                  />

                  {replyTo && replyTo.id === comment.id && !replyTo.parentId && (
                    <ReplyForm
                      value={replyText}
                      onChange={setReplyText}
                      onCancel={() => {
                        setReplyTo(null);
                        setReplyText("");
                      }}
                      onSubmit={() => handleAddReply(comment.id)}
                    />
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-16 mt-2 flex flex-col gap-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id}>
                          <AnimeCommentCard
                            avatarUrl={reply.user.avatar}
                            username={reply.user.name}
                            timeAgo={reply.created_at}
                            text={reply.body}
                            likes={reply.likes || 0}
                            dislikes={reply.dislikes || 0}
                            isReply
                            onLike={() => handleLike(reply.id, comment.id)}
                            onDislike={() => handleDislike(reply.id, comment.id)}
                            onReply={() =>
                              setReplyTo({ id: reply.id, parentId: comment.id })
                            }
                          />

                          {replyTo &&
                            replyTo.id === reply.id &&
                            replyTo.parentId === comment.id && (
                              <ReplyForm
                                value={replyText}
                                onChange={setReplyText}
                                onCancel={() => {
                                  setReplyTo(null);
                                  setReplyText("");
                                }}
                                onSubmit={() =>
                                  handleAddReply(reply.id, comment.id)
                                }
                                nested
                              />
                            )}

                          {reply.replies && reply.replies.length > 0 && (
                            <div className="pl-12 mt-2 flex flex-col gap-4">
                              {reply.replies.map((subreply) => (
                                <AnimeCommentCard
                                  key={subreply.id}
                                  avatarUrl={subreply.user.avatar}
                                  username={subreply.user.name}
                                  timeAgo={subreply.created_at}
                                  text={subreply.body}
                                  likes={subreply.likes || 0}
                                  dislikes={subreply.dislikes || 0}
                                  isReply
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Компонент для відповіді
const ReplyForm: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  nested?: boolean;
}> = ({ value, onChange, onSubmit, onCancel, nested }) => (
  <div
    className={`${
      nested ? "pl-12" : "pl-16"
    } mt-2 flex flex-col gap-2`}
  >
    <textarea
      className="bg-[#111113] text-white rounded-2xl border border-[#888] p-4 min-h-[40px] resize-none focus:outline-none focus:border-[#888] text-[18px] transition-colors placeholder:text-[#888] w-full"
      placeholder="Ваша відповідь..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <div className="flex gap-2 justify-end">
      <button
        className="px-4 py-1 rounded-lg bg-[#23242A] text-white text-base font-semibold border border-[#44454A] hover:bg-[#33344A] transition"
        onClick={onSubmit}
      >
        Відповісти
      </button>
      <button
        className="px-4 py-1 rounded-lg bg-transparent text-[#888] border border-[#44454A] hover:bg-[#23242A] transition"
        onClick={onCancel}
      >
        Скасувати
      </button>
    </div>
  </div>
);

export default AnimeCommentSection;
