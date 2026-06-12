export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-around bg-white p-4 shadow-2xl rounded-t-3xl">

      <div className="text-purple-600 font-semibold">
        Home
      </div>

      <div className="text-gray-400">
        Track
      </div>

      <div className="text-gray-400">
        Map
      </div>

      <div className="text-gray-400">
        Alerts
      </div>

      <div className="text-gray-400">
        Profile
      </div>

    </div>
  );
}