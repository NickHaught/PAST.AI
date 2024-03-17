
interface Props {
  navItems: string[];
}

const InnerNavbar = ({ navItems }: Props) => {
  return (
    <div className="flex items-start">
      {navItems.map((item, index) => (
        <button key={index} className="text-white hover:text-gray-500 transition-colors duration-200 bg-transparent border-none focus:outline-none pb-5">
          {item}
        </button>
      ))}
    </div>
  );
};

export default InnerNavbar;
