import { Topbar } from "@/components/layout/topbar";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { getNotifications } from "@/lib/data";

export default async function NotificationsPage() {
  const items = await getNotifications(30);

  return (
    <>
      <Topbar title="Notifications" />
      <div className="mx-auto w-full max-w-2xl p-5 lg:p-8">
        <NotificationsList items={items} />
      </div>
    </>
  );
}
