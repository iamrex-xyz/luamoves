import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MovingInfo } from "@/pages/Index";
import { Task } from "@/lib/taskGenerator";
import {
  isEnergyTask,
  isInternetTask,
  isMovingTask,
  isMovingFeedbackTask,
  isBoxesTask,
  isInsuranceTask,
  isLiabilityTask,
  isForwardingTask,
  isVerhuisliftTask,
  isCleaningTask,
  isSmokeDetectorTask,
  isGardenTask,
  isRenovationTask,
  isHypothekTask,
  isBouwkundigeKeuringTask,
  isNotarisTask,
  isTaxatieTask,
  isOpstalTask,
  isSlotTask,
  isBudgetTask,
  isInviteHouseholdTask,
  needsEnergyQuestions,
  needsInternetQuestions,
  needsMovingQuestions,
  needsBoxesQuestions,
  needsInsuranceQuestions,
  needsLiabilityQuestions,
  needsForwardingQuestions,
  needsCleaningQuestions,
  needsSmokeDetectorQuestions,
  needsGardenQuestions,
  needsRenovationQuestions,
  getTaskRedirectUrl,
} from "@/lib/taskTypeHelpers";
import { getSmartQuestionForTask, SmartQuestionType } from "@/lib/smartQuestions";
import { PromptType } from "@/components/ContextualPromptDialog";

export type QuestionDialogType = 
  | "energy"
  | "internet"
  | "moving"
  | "movingFeedback"
  | "boxes"
  | "insurance"
  | "liability"
  | "forwarding"
  | "postNLPreparation"
  | "cleaning"
  | "smokeDetector"
  | "garden"
  | "renovation"
  | "partnerInvite"
  | "budget"
  | "inviteHousehold"
  | "hypotheek"
  | "bouwkundigeKeuring"
  | "notaris"
  | "taxatie"
  | "opstal"
  | "slotcilinder"
  | "verhuislift"
  | null;

export type SmartQuestionState = {
  type: SmartQuestionType;
  task: Task;
  afterQuestions?: "deal" | "complete";
} | null;

export type ContextualPromptState = {
  type: PromptType;
  task: Task;
} | null;

export const useQuestionDialogs = (
  movingInfo: MovingInfo,
  onUpdateMovingInfo?: (data: Partial<MovingInfo>) => void,
  isGuest?: boolean,
  onToggleTaskStatus?: (taskId: string) => void
) => {
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<QuestionDialogType>(null);
  const [currentDialogTask, setCurrentDialogTask] = useState<Task | null>(null);
  const [smartQuestion, setSmartQuestion] = useState<SmartQuestionState>(null);
  const [contextualPrompt, setContextualPrompt] = useState<ContextualPromptState>(null);

  // Handle "Regelen" button click - determines which questions to show
  const handleRegelenClick = useCallback((e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setCurrentDialogTask(task);
    
    // Invite household task - opens invite dialog
    if (isInviteHouseholdTask(task)) {
      setActiveDialog("inviteHousehold");
      return;
    }
    
    // Budget task - opens budget dialog (no external navigation)
    if (isBudgetTask(task)) {
      setActiveDialog("budget");
      return;
    }
    
    // Check each task type and show appropriate questions
    if (isEnergyTask(task)) {
      // Energie-taak opent altijd het intakeformulier, geen redirect naar deals
      setActiveDialog("energy");
      return;
    }
    
    if (isInternetTask(task)) {
      // Internet-taak opent altijd het intakeformulier, geen redirect naar deals
      setActiveDialog("internet");
      return;
    }
    
    if (isMovingFeedbackTask(task)) {
      // Feedback taak opent de feedback dialog
      setActiveDialog("movingFeedback");
      return;
    }
    
    if (isMovingTask(task)) {
      // Verhuisbedrijf-taak opent altijd het intakeformulier, geen redirect naar deals
      setActiveDialog("moving");
      return;
    }
    
    if (isBoxesTask(task)) {
      // Dozen-taak opent altijd het intakeformulier
      setActiveDialog("boxes");
      return;
    }
    
    if (isInsuranceTask(task)) {
      // Verzekeringen-taak opent altijd het intakeformulier, geen redirect naar deals
      setActiveDialog("insurance");
      return;
    }
    
    if (isLiabilityTask(task)) {
      // Aansprakelijkheidsverzekering-taak opent altijd het intakeformulier
      setActiveDialog("liability");
      return;
    }
    
    if (isForwardingTask(task)) {
      setActiveDialog("postNLPreparation");
      return;
    }
    
    if (isVerhuisliftTask(task)) {
      // Verhuislift-taak opent altijd het intakeformulier
      setActiveDialog("verhuislift");
      return;
    }
    
    if (isCleaningTask(task)) {
      // Schoonmaak-taak opent altijd het intakeformulier, geen redirect naar deals
      setActiveDialog("cleaning");
      return;
    }
    
    if (isSmokeDetectorTask(task)) {
      // Rookmelder-taak opent altijd het intakeformulier
      setActiveDialog("smokeDetector");
      return;
    }
    
    if (isGardenTask(task)) {
      // Tuin-taak opent altijd het intakeformulier
      setActiveDialog("garden");
      return;
    }
    
    if (isRenovationTask(task)) {
      // Renovatie-taak opent altijd het intakeformulier
      setActiveDialog("renovation");
      return;
    }
    
    // KOOP-specifieke taken - openen intakeformulieren
    if (isHypothekTask(task)) {
      setActiveDialog("hypotheek");
      return;
    }
    
    if (isBouwkundigeKeuringTask(task)) {
      setActiveDialog("bouwkundigeKeuring");
      return;
    }
    
    if (isNotarisTask(task)) {
      setActiveDialog("notaris");
      return;
    }
    
    if (isTaxatieTask(task)) {
      setActiveDialog("taxatie");
      return;
    }
    
    if (isOpstalTask(task)) {
      setActiveDialog("opstal");
      return;
    }
    
    if (isSlotTask(task)) {
      setActiveDialog("slotcilinder");
      return;
    }
    
    // Check for smart questions
    if (!isGuest) {
      const smartQuestionType = getSmartQuestionForTask(task.id, task.title, movingInfo);
      if (smartQuestionType) {
        setSmartQuestion({ type: smartQuestionType, task, afterQuestions: "deal" });
        return;
      }
    }
    
    // No questions needed - go directly to deals
    navigate(`/deals?task=${encodeURIComponent(task.title)}`);
  }, [movingInfo, navigate, isGuest]);

  // Generic complete handler
  const handleDialogComplete = useCallback((data: Partial<MovingInfo> & Record<string, any>) => {
    if (onUpdateMovingInfo) {
      onUpdateMovingInfo(data as Partial<MovingInfo>);
    }
  }, [onUpdateMovingInfo]);

  // Redirect handlers for each dialog type
  const handleDialogRedirect = useCallback((dialogType: QuestionDialogType) => {
    const redirectUrl = getTaskRedirectUrl(dialogType || "");
    if (redirectUrl) {
      navigate(`/deals?task=${encodeURIComponent(redirectUrl)}`);
    }
  }, [navigate]);

  // Smart question complete handler
  const handleSmartQuestionComplete = useCallback((data: Partial<MovingInfo> & Record<string, any>) => {
    if (onUpdateMovingInfo) {
      onUpdateMovingInfo(data as Partial<MovingInfo>);
    }
    
    const currentTask = smartQuestion?.task;
    const afterAction = smartQuestion?.afterQuestions;
    setSmartQuestion(null);
    
    if (currentTask) {
      const nextQuestion = getSmartQuestionForTask(currentTask.id, currentTask.title, { ...movingInfo, ...data });
      
      if (nextQuestion) {
        setSmartQuestion({ type: nextQuestion, task: currentTask, afterQuestions: afterAction });
        return;
      }
      
      if (afterAction === "deal") {
        navigate(`/deals?task=${encodeURIComponent(currentTask.title)}`);
      }
    }
  }, [smartQuestion, movingInfo, navigate, onUpdateMovingInfo]);

  // Contextual prompt complete handler
  const handleContextualPromptComplete = useCallback((data: Partial<MovingInfo>) => {
    if (onUpdateMovingInfo) {
      onUpdateMovingInfo(data);
    }
    setContextualPrompt(null);
  }, [onUpdateMovingInfo]);

  const closeActiveDialog = useCallback(() => {
    setActiveDialog(null);
    setCurrentDialogTask(null);
  }, []);

  const showPartnerInvite = useCallback(() => {
    setActiveDialog("partnerInvite");
  }, []);

  // Complete the current task
  const handleCompleteCurrentTask = useCallback(() => {
    if (currentDialogTask && onToggleTaskStatus) {
      onToggleTaskStatus(currentDialogTask.id);
    }
  }, [currentDialogTask, onToggleTaskStatus]);

  return {
    // Dialog states
    activeDialog,
    setActiveDialog,
    currentDialogTask,
    smartQuestion,
    setSmartQuestion,
    contextualPrompt,
    setContextualPrompt,
    
    // Handlers
    handleRegelenClick,
    handleDialogComplete,
    handleDialogRedirect,
    handleSmartQuestionComplete,
    handleContextualPromptComplete,
    closeActiveDialog,
    showPartnerInvite,
    handleCompleteCurrentTask,
  };
};
