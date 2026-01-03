import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MovingInfo } from "@/pages/Index";
import { Task } from "@/lib/taskGenerator";
import {
  isEnergyTask,
  isInternetTask,
  isMovingTask,
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
  isGuest?: boolean
) => {
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<QuestionDialogType>(null);
  const [smartQuestion, setSmartQuestion] = useState<SmartQuestionState>(null);
  const [contextualPrompt, setContextualPrompt] = useState<ContextualPromptState>(null);

  // Handle "Regelen" button click - determines which questions to show
  const handleRegelenClick = useCallback((e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    
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
      if (needsInternetQuestions(movingInfo)) {
        setActiveDialog("internet");
        return;
      }
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    if (isMovingTask(task)) {
      if (needsMovingQuestions(movingInfo)) {
        setActiveDialog("moving");
        return;
      }
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    if (isBoxesTask(task)) {
      if (needsBoxesQuestions(movingInfo)) {
        setActiveDialog("boxes");
        return;
      }
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    if (isInsuranceTask(task)) {
      if (needsInsuranceQuestions(movingInfo)) {
        setActiveDialog("insurance");
        return;
      }
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    if (isLiabilityTask(task)) {
      if (needsLiabilityQuestions(movingInfo)) {
        setActiveDialog("liability");
        return;
      }
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    if (isForwardingTask(task)) {
      setActiveDialog("postNLPreparation");
      return;
    }
    
    if (isVerhuisliftTask(task)) {
      // Verhuislift gaat direct naar deals (vragen worden via smart questions gesteld)
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    if (isCleaningTask(task)) {
      if (needsCleaningQuestions(movingInfo)) {
        setActiveDialog("cleaning");
        return;
      }
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    if (isSmokeDetectorTask(task)) {
      if (needsSmokeDetectorQuestions(movingInfo)) {
        setActiveDialog("smokeDetector");
        return;
      }
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    if (isGardenTask(task)) {
      if (needsGardenQuestions(movingInfo)) {
        setActiveDialog("garden");
        return;
      }
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    if (isRenovationTask(task)) {
      if (needsRenovationQuestions(movingInfo)) {
        setActiveDialog("renovation");
        return;
      }
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
      return;
    }
    
    // KOOP-specifieke taken - direct naar deals (geen extra vragen nodig)
    if (isHypothekTask(task) || isBouwkundigeKeuringTask(task) || isNotarisTask(task) || 
        isTaxatieTask(task) || isOpstalTask(task) || isSlotTask(task)) {
      navigate(`/deals?task=${encodeURIComponent(task.title)}`);
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
  }, []);

  const showPartnerInvite = useCallback(() => {
    setActiveDialog("partnerInvite");
  }, []);

  return {
    // Dialog states
    activeDialog,
    setActiveDialog,
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
  };
};
