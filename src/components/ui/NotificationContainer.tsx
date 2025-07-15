import type React from "react";
import { useNotificationStore } from "../../store/notification-store";
import Card from "./Card";

const NotificationContainer: React.FC = () => {
	const { getActiveNotifications, dismissNotification } =
		useNotificationStore();
	const notifications = getActiveNotifications();

	if (notifications.length === 0) return null;

	const getNotificationStyles = (type: string) => {
		switch (type) {
			case "success":
				return "bg-green-50 border-green-200 text-green-800";
			case "error":
				return "bg-red-50 border-red-200 text-red-800";
			case "warning":
				return "bg-yellow-50 border-yellow-200 text-yellow-800";
			case "info":
				return "bg-blue-50 border-blue-200 text-blue-800";
			default:
				return "bg-gray-50 border-gray-200 text-gray-800";
		}
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "success":
				return "✓";
			case "error":
				return "✕";
			case "warning":
				return "⚠";
			case "info":
				return "ℹ";
			default:
				return "•";
		}
	};

	return (
		<div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
			{notifications.map((notification) => (
				<Card
					key={notification.id}
					className={`${getNotificationStyles(notification.type)} transition-all duration-300 ease-in-out animate-slide-in-right`}
					padding="sm"
				>
					<div className="flex items-start justify-between">
						<div className="flex items-start space-x-2">
							<div className="flex-shrink-0 mt-0.5">
								<span className="text-lg">
									{getNotificationIcon(notification.type)}
								</span>
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="text-sm font-medium">{notification.title}</h4>
								{notification.message && (
									<p className="text-sm mt-1 opacity-90">
										{notification.message}
									</p>
								)}
								{notification.action && (
									<button
										type="button"
										onClick={notification.action.handler}
										className="text-sm underline mt-2 hover:no-underline"
									>
										{notification.action.label}
									</button>
								)}
							</div>
						</div>
						<button
							type="button"
							onClick={() => dismissNotification(notification.id)}
							className="flex-shrink-0 ml-2 text-lg opacity-60 hover:opacity-100 transition-opacity"
						>
							×
						</button>
					</div>
				</Card>
			))}
		</div>
	);
};

export default NotificationContainer;
