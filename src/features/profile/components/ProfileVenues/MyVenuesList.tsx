export default function MyVenuesList() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-8 text-primary">
        <h3 className="font-noto text-[18px] font-bold mb-2">Your venues</h3>
        <p className="text-primary/80">
          When you create venues, they’ll appear here. You can edit them, manage
          availability, and view bookings.
        </p>
      </div>
    </div>
  );
}
