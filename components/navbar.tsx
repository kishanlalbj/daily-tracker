import Link from "next/link";

const Navbar = () => {
  return (
    <div className="h-14 bg-zinc-900 text-white">
      <div className="container mx-auto h-full max-w-4/5 flex items-center justify-between">
        <Link href="/">CutTrack</Link>
      </div>
    </div>
  );
};

export default Navbar;
