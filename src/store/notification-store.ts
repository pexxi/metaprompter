import { create } from "zustand";

export interface AppNotification {
	id: string;
	type: "success" | "error" | "warning" | "info";
	title: string;
	message?: string;
	timestamp: Date;
	duration?: number; // in milliseconds, null for persistent
	dismissed: boolean;
	action?: {
		label: string;
		handler: () => void;
	};
}

interface NotificationState {
	notifications: AppNotification[];

	// Actions
	addNotification: (
		notification: Omit<AppNotification, "id" | "timestamp" | "dismissed">,
	) => void;
	dismissNotification: (id: string) => void;
	clearAllNotifications: () => void;

	// Convenience methods
	success: (title: string, message?: string, duration?: number) => void;
	error: (title: string, message?: string, duration?: number) => void;
	warning: (title: string, message?: string, duration?: number) => void;
	info: (title: string, message?: string, duration?: number) => void;

	// Getters
	getActiveNotifications: () => AppNotification[];
	hasNotifications: () => boolean;
}

const generateId = () =>
	`notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useNotificationStore = create<NotificationState>((set, get) => ({
	notifications: [],

	addNotification: (notification) => {
		const newNotification: AppNotification = {
			id: generateId(),
			timestamp: new Date(),
			dismissed: false,
			duration: notification.duration || 5000, // Default 5 seconds
			...notification,
		};

		set((state) => ({
			notifications: [...state.notifications, newNotification],
		}));

		// Auto-dismiss after duration
		if (newNotification.duration && newNotification.duration > 0) {
			setTimeout(() => {
				get().dismissNotification(newNotification.id);
			}, newNotification.duration);
		}
	},

	dismissNotification: (id: string) => {
		set((state) => ({
			notifications: state.notifications.map((notification) =>
				notification.id === id
					? { ...notification, dismissed: true }
					: notification,
			),
		}));

		// Remove dismissed notifications after a delay
		setTimeout(() => {
			set((state) => ({
				notifications: state.notifications.filter((n) => n.id !== id),
			}));
		}, 300);
	},

	clearAllNotifications: () => {
		set({ notifications: [] });
	},

	success: (title: string, message?: string, duration = 5000) => {
		get().addNotification({
			type: "success",
			title,
			message,
			duration,
		});
	},

	error: (title: string, message?: string, duration = 8000) => {
		get().addNotification({
			type: "error",
			title,
			message,
			duration,
		});
	},

	warning: (title: string, message?: string, duration = 6000) => {
		get().addNotification({
			type: "warning",
			title,
			message,
			duration,
		});
	},

	info: (title: string, message?: string, duration = 4000) => {
		get().addNotification({
			type: "info",
			title,
			message,
			duration,
		});
	},

	getActiveNotifications: () => {
		return get().notifications.filter(
			(notification) => !notification.dismissed,
		);
	},

	hasNotifications: () => {
		return get().notifications.some((notification) => !notification.dismissed);
	},
}));
