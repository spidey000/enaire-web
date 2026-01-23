// Quiz logic utilities
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateScore(answers, questions) {
  const correct = answers.filter(a => a.isCorrect).length;
  return {
    correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100)
  };
}

export function filterQuestions(questions, filters) {
  let filtered = [...questions];

  // Filter by module
  if (filters.moduleIds && filters.moduleIds.length > 0) {
    filtered = filtered.filter(q => filters.moduleIds.includes(q.moduleId));
  }

  // Filter by difficulty
  if (filters.difficulty && filters.difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === parseInt(filters.difficulty));
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(q =>
      q.tags && q.tags.some(tag => filters.tags.includes(tag))
    );
  }

  // Limit number of questions
  if (filters.count && filtered.length > filters.count) {
    filtered = shuffleArray(filtered).slice(0, filters.count);
  }

  return filtered;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export class QuizSession {
  constructor(questions, options = {}) {
    this.questions = questions;
    this.currentQuestion = 0;
    this.answers = [];
    this.mode = options.mode || 'practice'; // 'practice' or 'exam'
    this.startTime = Date.now();
    this.timeElapsed = 0;
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestion];
  }

  submitAnswer(answerId) {
    const question = this.getCurrentQuestion();
    const isCorrect = answerId === question.correctAnswer;

    const answer = {
      questionId: question.questionId,
      answer: answerId,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeSpent: this.getElapsedTime()
    };

    this.answers.push(answer);

    if (this.mode === 'practice') {
      // In practice mode, show feedback immediately
      return {
        isCorrect,
        explanation: question.explanation,
        canContinue: true
      };
    }

    // In exam mode, don't show feedback until the end
    return { canContinue: true };
  }

  nextQuestion() {
    if (this.currentQuestion < this.questions.length - 1) {
      this.currentQuestion++;
      return true;
    }
    return false;
  }

  getElapsedTime() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  getResults() {
    const score = calculateScore(this.answers, this.questions);
    const wrongAnswers = this.answers
      .filter(a => !a.isCorrect)
      .map(a => ({
        question: this.questions.find(q => q.questionId === a.questionId),
        yourAnswer: a.answer,
        correctAnswer: a.correctAnswer
      }));

    return {
      ...score,
      timeSpent: this.getElapsedTime(),
      wrongAnswers,
      mode: this.mode
    };
  }

  isComplete() {
    return this.currentQuestion >= this.questions.length - 1;
  }
}
