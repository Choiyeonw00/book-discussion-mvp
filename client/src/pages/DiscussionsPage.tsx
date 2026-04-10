import { useState, useEffect, type FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { discussionsApi } from '../api/discussions';
import { memosApi } from '../api/memos';
import { useAuthStore } from '../stores/authStore';
import type { Discussion, Memo, RecommendedTopic, ApiError } from '../types';
import { AxiosError } from 'axios';

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '24px 16px',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: 16,
    fontSize: 14,
    color: '#3182ce',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: '#2d3748',
  },
  field: {
    marginBottom: 14,
  },
  label: {
    display: 'block',
    marginBottom: 4,
    fontSize: 14,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #ddd',
    borderRadius: 4,
    boxSizing: 'border-box' as const,
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 4,
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #ddd',
    borderRadius: 4,
    boxSizing: 'border-box' as const,
    minHeight: 80,
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #ddd',
    borderRadius: 4,
    boxSizing: 'border-box' as const,
    backgroundColor: '#fff',
  },
  button: {
    padding: '10px 24px',
    backgroundColor: '#3182ce',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  discussionItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
  },
  discussionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: 4,
  },
  discussionMeta: {
    fontSize: 12,
    color: '#a0aec0',
  },
  recommendedBadge: {
    display: 'inline-block',
    backgroundColor: '#fefcbf',
    color: '#975a16',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 500,
    marginLeft: 8,
  },
  recCard: {
    padding: '12px 16px',
    border: '1px dashed #3182ce',
    borderRadius: 6,
    marginBottom: 8,
    cursor: 'pointer',
    backgroundColor: '#ebf8ff',
  },
  recTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#2b6cb0',
    marginBottom: 4,
  },
  recContent: {
    fontSize: 13,
    color: '#4a5568',
  },
  filterRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    padding: '6px 14px',
    fontSize: 13,
    border: '1px solid #ddd',
    borderRadius: 20,
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#3182ce',
    color: '#fff',
    borderColor: '#3182ce',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '30px 20px',
    color: '#a0aec0',
    fontSize: 14,
  },
  serverError: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    padding: '10px 12px',
    borderRadius: 4,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
};

function DiscussionsPage() {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedTopic[]>([]);
  const [myMemos, setMyMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMine, setFilterMine] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formMemoId, setFormMemoId] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  let currentUserId = user?.id || '';
  if (!currentUserId && accessToken) {
    try {
      const token = accessToken;
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1] || ''));
      currentUserId = payload.userId || '';
    } catch { /* ignore */ }
  }

  const fetchData = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const params = filterMine && currentUserId ? { authorId: currentUserId } : undefined;
      const [discRes, recRes, memoRes] = await Promise.all([
        discussionsApi.listByGroup(groupId!, params),
        discussionsApi.getRecommendations(groupId!).catch(() => ({ data: [] as RecommendedTopic[] })),
        memosApi.listByGroup(groupId!).catch(() => ({ data: { myMemos: [] as Memo[], publicMemos: [] as Memo[] } })),
      ]);
      setDiscussions(discRes.data);
      setRecommendations(recRes.data);
      setMyMemos(memoRes.data.myMemos || []);
    } catch {
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId, filterMine]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs: Record<string, string> = {};
    if (!formTitle.trim()) errs.title = '토론 주제를 입력해주세요';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!groupId) return;

    setSubmitting(true);
    try {
      await discussionsApi.create(groupId!, {
        title: formTitle.trim(),
        content: formContent.trim() || undefined,
        memoId: formMemoId || undefined,
      });
      setFormTitle('');
      setFormContent('');
      setFormMemoId('');
      fetchData();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setServerError(axiosErr.response?.data?.error?.message || '토론 주제 생성에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectRecommendation = async (rec: RecommendedTopic) => {
    if (!groupId) return;
    try {
      await discussionsApi.create(groupId!, {
        title: rec.title,
        content: rec.content,
      });
      fetchData();
    } catch { /* ignore */ }
  };

  return (
    <div style={styles.container}>
      <Link to={`/groups/${groupId}`} style={styles.backLink}>← 모임으로</Link>
      <h1 style={styles.title}>💬 토론</h1>

      {/* Create Discussion Form */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>토론 주제 만들기</div>
        <form onSubmit={handleSubmit} noValidate>
          {serverError && <div style={styles.serverError}>{serverError}</div>}

          <div style={styles.field}>
            <label style={styles.label}>주제 제목 *</label>
            <input
              type="text"
              style={{ ...styles.input, ...(formErrors.title ? styles.inputError : {}) }}
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="토론 주제를 입력해주세요"
            />
            {formErrors.title && <div style={styles.errorText}>{formErrors.title}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>내용</label>
            <textarea
              style={styles.textarea}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="토론 주제에 대한 설명 (선택)"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>메모 연결 (선택)</label>
            <select
              style={styles.select}
              value={formMemoId}
              onChange={(e) => setFormMemoId(e.target.value)}
            >
              <option value="">메모를 선택하세요 (선택)</option>
              {myMemos.map((m) => (
                <option key={m.id} value={m.id}>
                  p.{m.pageStart}~{m.pageEnd}: {m.content.slice(0, 40)}...
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            style={{ ...styles.button, ...(submitting ? styles.buttonDisabled : {}) }}
            disabled={submitting}
          >
            {submitting ? '생성 중...' : '토론 주제 만들기'}
          </button>
        </form>
      </div>

      {/* Recommended Topics */}
      {recommendations.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>✨ 추천 주제</div>
          {recommendations.map((rec, i) => (
            <div
              key={i}
              style={styles.recCard}
              onClick={() => handleSelectRecommendation(rec)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelectRecommendation(rec)}
            >
              <div style={styles.recTitle}>{rec.title}</div>
              <div style={styles.recContent}>{rec.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div style={styles.filterRow}>
        <button
          style={{ ...styles.filterBtn, ...(!filterMine ? styles.filterBtnActive : {}) }}
          onClick={() => setFilterMine(false)}
        >
          전체
        </button>
        <button
          style={{ ...styles.filterBtn, ...(filterMine ? styles.filterBtnActive : {}) }}
          onClick={() => setFilterMine(true)}
        >
          내 작성
        </button>
      </div>

      {/* Discussion List */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>토론 주제 목록</div>
        {loading ? (
          <div style={styles.emptyState}>불러오는 중...</div>
        ) : discussions.length === 0 ? (
          <div style={styles.emptyState}>토론 주제가 없습니다</div>
        ) : (
          discussions.map((d) => (
            <div
              key={d.id}
              style={styles.discussionItem}
              onClick={() => navigate(`/discussions/${d.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/discussions/${d.id}`)}
            >
              <div style={styles.discussionTitle}>
                {d.title}
                {d.isRecommended && <span style={styles.recommendedBadge}>추천</span>}
              </div>
              <div style={styles.discussionMeta}>
                {d.authorNickname} · {new Date(d.createdAt).toLocaleDateString()}
                {d.memoId && ' · 📝 메모 연결됨'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DiscussionsPage;
