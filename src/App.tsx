import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { LessonModal } from './components/LessonModal';
import { EditProfileModal } from './components/EditProfileModal';
import { DashboardView } from './components/views/DashboardView';
import { RoadmapView } from './components/views/RoadmapView';
import { VisualizerView } from './components/views/VisualizerView';
import { PlaygroundView } from './components/views/PlaygroundView';
import { StatsView } from './components/views/StatsView';
import { UserState, Lesson, RoadmapModule, UserSubmission } from './types';
import { ROADMAP } from './data/roadmapData';

const CLEAN_USER_STATE: UserState = {
  userName: 'Học viên',
  xp: 0,
  level: 1,
  streak: 1,
  bestStreak: 1,
  completed: [],
  acCount: 0,
  activity: {},
  submissions: []
};

const xpForLevel = (l: number) => l * 520;
const calculateLevel = (xp: number) => {
  let lvl = 1;
  while (xp >= xpForLevel(lvl)) lvl++;
  return lvl;
};

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('learningvn_cplusplus_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear out stale mock demo data if user had 2335 XP or default demo user
        if (parsed.xp === 2335 || !parsed.userName || parsed.userName === 'Hiếu Nguyễn') {
          return CLEAN_USER_STATE;
        }
        return { ...CLEAN_USER_STATE, ...parsed };
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
    return CLEAN_USER_STATE;
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 860;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);

  // Lesson modal state
  const [activeModalLesson, setActiveModalLesson] = useState<{
    module: RoadmapModule;
    lesson: Lesson;
  } | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('learningvn_cplusplus_state', JSON.stringify(userState));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [userState]);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleEarnXP = (amount: number, reason: string) => {
    setUserState(prev => {
      const nextXP = prev.xp + amount;
      const nextLvl = calculateLevel(nextXP);
      const todayKey = new Date().toISOString().slice(0, 10);
      const updatedActivity = {
        ...prev.activity,
        [todayKey]: (prev.activity[todayKey] || 0) + amount
      };
      const nextStreak = prev.streak === 0 ? 1 : prev.streak;

      return {
        ...prev,
        xp: nextXP,
        level: nextLvl,
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
        activity: updatedActivity
      };
    });

    showToast(`+${amount} XP · ${reason}`);
  };

  const handleUpdateUserName = (newName: string) => {
    setUserState(prev => ({
      ...prev,
      userName: newName
    }));
    showToast(`Đã đổi tên học viên thành: ${newName}`);
  };

  const handleResetAll = () => {
    try {
      localStorage.removeItem('learningvn_cplusplus_state');
    } catch {
      // ignore
    }
    setUserState(CLEAN_USER_STATE);
    showToast('Đã làm mới và đặt lại toàn bộ trang về ban đầu!');
  };

  const handleCompleteLesson = (lesson: Lesson) => {
    if (userState.completed.includes(lesson.id)) return;

    setUserState(prev => ({
      ...prev,
      completed: [...prev.completed, lesson.id]
    }));

    handleEarnXP(lesson.xp, `Hoàn thành: ${lesson.title}`);
    setActiveModalLesson(null);
  };

  const handleRecordSubmission = (sub: UserSubmission) => {
    setUserState(prev => ({
      ...prev,
      acCount: sub.verdict === 'AC' ? prev.acCount + 1 : prev.acCount,
      submissions: [sub, ...prev.submissions.slice(0, 19)]
    }));
  };

  const handleOpenLesson = (module: RoadmapModule, lesson: Lesson) => {
    setActiveModalLesson({ module, lesson });
  };

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    roadmap: 'Lộ trình Advanced C++',
    visualizer: 'Algorithm Visualizer',
    playground: 'Code Playground & Judge',
    stats: 'Thống kê & Phân tích Năng lực'
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f0f11] text-[#f4f4f6]">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <div className={`md:relative fixed inset-y-0 left-0 z-50 transition-transform md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setMobileMenuOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          userState={userState}
          onOpenProfile={() => setProfileModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          title={viewTitles[currentView] || 'LearningVN'}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          userState={userState}
          onOpenProfile={() => setProfileModalOpen(true)}
          onResetAll={handleResetAll}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-7 py-6 sm:py-8">
            {currentView === 'dashboard' && (
              <DashboardView
                userState={userState}
                onNavigate={setCurrentView}
                onOpenProfile={() => setProfileModalOpen(true)}
                onOpenLessonById={(id) => {
                  for (const m of ROADMAP) {
                    const l = m.lessons.find(item => item.id === id);
                    if (l) {
                      setActiveModalLesson({ module: m, lesson: l });
                      break;
                    }
                  }
                }}
              />
            )}

            {currentView === 'roadmap' && (
              <RoadmapView
                userState={userState}
                onOpenLesson={handleOpenLesson}
              />
            )}

            {currentView === 'visualizer' && (
              <VisualizerView onEarnXP={handleEarnXP} />
            )}

            {currentView === 'playground' && (
              <PlaygroundView
                onEarnXP={handleEarnXP}
                onRecordSubmission={handleRecordSubmission}
              />
            )}

            {currentView === 'stats' && (
              <StatsView userState={userState} />
            )}
          </div>
        </main>
      </div>

      {/* Profile & Settings Modal */}
      <EditProfileModal
        isOpen={profileModalOpen}
        currentName={userState.userName}
        onClose={() => setProfileModalOpen(false)}
        onSaveName={handleUpdateUserName}
        onResetAll={handleResetAll}
      />

      {/* Lesson Details Modal */}
      {activeModalLesson && (
        <LessonModal
          module={activeModalLesson.module}
          lesson={activeModalLesson.lesson}
          isCompleted={userState.completed.includes(activeModalLesson.lesson.id)}
          onClose={() => setActiveModalLesson(null)}
          onComplete={handleCompleteLesson}
        />
      )}

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
