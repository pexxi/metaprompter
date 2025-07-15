import type React from "react";
import { useState, useEffect } from "react";
import { useChat } from "../../hooks/useChat";
import { useNotificationStore } from "../../store/notification-store";
import { useProjectStore } from "../../store/project-store";
import { database } from "../../lib/database/database";
import ChatInterface from "../chat/ChatInterface";
import PromptGenerator from "../prompt/PromptGenerator";
import RequirementsPanel from "../requirements/RequirementsPanel";
import SettingsPanel from "../settings/SettingsPanel";
import NotificationContainer from "../ui/NotificationContainer";
import Header from "./Header";
import TwoColumnLayout from "./TwoColumnLayout";
import ProjectDropdown from "../project/ProjectDropdown";

const MainLayout: React.FC = () => {
	const [showSettings, setShowSettings] = useState<boolean>(false);
	const [isInitializing, setIsInitializing] = useState<boolean>(true);
	const [hasProcessedInitialProjects, setHasProcessedInitialProjects] = useState<boolean>(false);
	const { sendMessage, resetChatService } = useChat();
	const {
		currentProject,
		projectSummaries,
		createProject,
		loadProject,
		loadProjectSummaries,
		updateProject,
	} = useProjectStore();
	const { success: showSuccess, info: showInfo } = useNotificationStore();

	// Initialize database and load project summaries on component mount
	useEffect(() => {
		const initializeApp = async () => {
			try {
				await database.initialize();
				await loadProjectSummaries();
			} catch (error) {
				console.error("Failed to initialize database:", error);
			} finally {
				setIsInitializing(false);
			}
		};

		initializeApp();
	}, [loadProjectSummaries]);

	// Auto-create first project if no projects exist, or load the most recent project
	useEffect(() => {
		// Only run after initialization is complete and we haven't processed initial projects yet
		if (isInitializing || hasProcessedInitialProjects) return;

		const ensureActiveProject = async () => {
			try {
				if (projectSummaries.length === 0 && !currentProject) {
					// No projects exist, create the first one
					await createProject("My First Project", "Welcome to MetaPrompter! Start by describing your software project idea.");
				} else if (projectSummaries.length > 0 && !currentProject) {
					// Projects exist but none is selected, load the most recent one
					const mostRecentProject = projectSummaries[0]; // Already sorted by updated_at DESC
					await loadProject(mostRecentProject.id);
				}
			} catch (error) {
				console.error("Failed to ensure active project:", error);
			} finally {
				setHasProcessedInitialProjects(true);
			}
		};

		ensureActiveProject();
	}, [isInitializing, hasProcessedInitialProjects, projectSummaries, currentProject, createProject, loadProject]);

	// Get project title from current project
	const projectTitle = currentProject?.name || "";

	const handleNewProject = async () => {
		try {
			resetChatService();
			await createProject("New Project", "");

			showSuccess(
				"New project started",
				"A new project has been created and is ready to use.",
			);
		} catch (error) {
			console.error("Error starting new project:", error);
			showInfo(
				"Project creation failed",
				"There was an error creating a new project. Please try again.",
			);
		}
	};

	const handleProjectTitleChange = async (title: string) => {
		if (currentProject) {
			try {
				await updateProject({ name: title });
			} catch (error) {
				console.error("Error updating project title:", error);
			}
		}
	};

	const handleProjectSelect = async (projectId: string) => {
		try {
			await loadProject(projectId);
			resetChatService();
			showSuccess(
				"Project loaded",
				"The selected project has been loaded successfully.",
			);
		} catch (error) {
			console.error("Error loading project:", error);
			showInfo(
				"Project loading failed",
				"There was an error loading the project. Please try again.",
			);
		}
	};

	const handleSendMessage = (message: string) => {
		sendMessage(message);
	};

	const handleOpenSettings = () => {
		setShowSettings(true);
	};

	const handleCloseSettings = () => {
		setShowSettings(false);
		// Reset chat service when settings are closed to pick up new API keys
		resetChatService();
	};

	// Chat interface
	const leftColumn = <ChatInterface onSendMessage={handleSendMessage} />;

	const rightColumn = <RequirementsPanel />;

	const bottomSection = <PromptGenerator />;

	return (
		<div className="h-screen flex flex-col">
			<Header
				onNewProject={handleNewProject}
				projectTitle={projectTitle}
				onProjectTitleChange={handleProjectTitleChange}
				onOpenSettings={handleOpenSettings}
				projectDropdown={
					<ProjectDropdown onProjectSelect={handleProjectSelect} />
				}
			/>
			<div className="flex-1 min-h-0">
				<TwoColumnLayout
					leftColumn={leftColumn}
					rightColumn={rightColumn}
					bottomSection={bottomSection}
				/>
			</div>

			<SettingsPanel isOpen={showSettings} onClose={handleCloseSettings} />

			<NotificationContainer />
		</div>
	);
};

export default MainLayout;
