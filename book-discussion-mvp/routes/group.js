const express = require('express');
const router = express.Router();

let groups = [];
let nextId = 1;

// 참여자 { groupId, memberId(임시 닉네임) }
let members = [];

// 주제
let topics = [];
let topicNextId = 1;

// 댓글
let comments = [];
let commentNextId = 1;

// 메모
let memos = [];
let memoNextId = 1;

// ===== 모임 =====
router.post('/', (req, res) => {
  const { name, bookTitle, maxMembers, description } = req.body;
  if (!name || !bookTitle) return res.status(400).json({ error: 'name, bookTitle은 필수입니다.' });
  const group = {
    id: nextId++, name, bookTitle,
    maxMembers: maxMembers || 10,
    description: description || '',
    createdAt: new Date().toISOString()
  };
  groups.push(group);
  res.status(201).json(group);
});

router.get('/', (_req, res) => {
  res.json(groups.map(g => ({
    ...g,
    memberCount: members.filter(m => m.groupId === g.id).length
  })));
});

router.get('/:id', (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));
  if (!group) return res.status(404).json({ error: '모임을 찾을 수 없습니다.' });
  const memberCount = members.filter(m => m.groupId === group.id).length;
  res.json({ ...group, memberCount });
});

// ===== 참여 =====
router.post('/:id/join', (req, res) => {
  const groupId = parseInt(req.params.id);
  const group = groups.find(g => g.id === groupId);
  if (!group) return res.status(404).json({ error: '모임을 찾을 수 없습니다.' });

  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ error: 'nickname은 필수입니다.' });

  const currentMembers = members.filter(m => m.groupId === groupId);
  if (currentMembers.length >= group.maxMembers) {
    return res.status(400).json({ error: '모임 인원이 가득 찼습니다.' });
  }
  if (currentMembers.find(m => m.nickname === nickname)) {
    return res.status(400).json({ error: '이미 참여 중입니다.' });
  }

  members.push({ groupId, nickname });
  res.status(201).json({ groupId, nickname });
});

router.get('/:id/members', (req, res) => {
  const groupId = parseInt(req.params.id);
  res.json(members.filter(m => m.groupId === groupId));
});

// ===== 주제 =====
router.post('/:id/topics', (req, res) => {
  const groupId = parseInt(req.params.id);
  const group = groups.find(g => g.id === groupId);
  if (!group) return res.status(404).json({ error: '모임을 찾을 수 없습니다.' });

  const { title, author } = req.body;
  if (!title || !author) return res.status(400).json({ error: 'title, author는 필수입니다.' });

  const topic = {
    id: topicNextId++, groupId, title, author,
    createdAt: new Date().toISOString()
  };
  topics.push(topic);
  res.status(201).json(topic);
});

router.get('/:id/topics', (req, res) => {
  const groupId = parseInt(req.params.id);
  const groupTopics = topics.filter(t => t.groupId === groupId).map(t => ({
    ...t,
    commentCount: comments.filter(c => c.topicId === t.id).length
  }));
  res.json(groupTopics);
});

// ===== 댓글 =====
router.post('/:id/topics/:topicId/comments', (req, res) => {
  const groupId = parseInt(req.params.id);
  const topicId = parseInt(req.params.topicId);
  const topic = topics.find(t => t.id === topicId && t.groupId === groupId);
  if (!topic) return res.status(404).json({ error: '주제를 찾을 수 없습니다.' });

  const { author, content } = req.body;
  if (!author || !content) return res.status(400).json({ error: 'author, content는 필수입니다.' });

  const comment = {
    id: commentNextId++, topicId, groupId, author, content,
    createdAt: new Date().toISOString()
  };
  comments.push(comment);
  res.status(201).json(comment);
});

router.get('/:id/topics/:topicId/comments', (req, res) => {
  const topicId = parseInt(req.params.topicId);
  const groupId = parseInt(req.params.id);
  res.json(comments.filter(c => c.topicId === topicId && c.groupId === groupId));
});

router.delete('/:id/topics/:topicId/comments/:commentId', (req, res) => {
  const commentId = parseInt(req.params.commentId);
  const idx = comments.findIndex(c => c.id === commentId);
  if (idx === -1) return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
  comments.splice(idx, 1);
  res.status(204).send();
});

// ===== 메모 (기존 유지) =====
router.post('/:id/memos', (req, res) => {
  const groupId = parseInt(req.params.id);
  const group = groups.find(g => g.id === groupId);
  if (!group) return res.status(404).json({ error: '모임을 찾을 수 없습니다.' });
  const { readingProgress, content, isPublic = false } = req.body;
  if (!content) return res.status(400).json({ error: 'content는 필수입니다.' });
  const memo = { id: memoNextId++, groupId, readingProgress: readingProgress || null, content, isPublic, createdAt: new Date().toISOString() };
  memos.push(memo);
  res.status(201).json(memo);
});

router.get('/:id/memos', (req, res) => {
  res.json(memos.filter(m => m.groupId === parseInt(req.params.id)));
});

router.delete('/:id/memos/:memoId', (req, res) => {
  const memoId = parseInt(req.params.memoId);
  const idx = memos.findIndex(m => m.id === memoId && m.groupId === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: '메모를 찾을 수 없습니다.' });
  memos.splice(idx, 1);
  res.status(204).send();
});

router.patch('/:id/memos/:memoId/visibility', (req, res) => {
  const memoId = parseInt(req.params.memoId);
  const memo = memos.find(m => m.id === memoId && m.groupId === parseInt(req.params.id));
  if (!memo) return res.status(404).json({ error: '메모를 찾을 수 없습니다.' });
  memo.isPublic = !memo.isPublic;
  res.json(memo);
});

module.exports = router;
