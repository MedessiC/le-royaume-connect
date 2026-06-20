type ChatDateSeparatorProps = {
  label: string;
};

const ChatDateSeparator = ({ label }: ChatDateSeparatorProps) => (
  <div className="my-3 flex justify-center">
    <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-medium text-[#54656f] shadow-sm dark:bg-[#182229] dark:text-[#8696a0]">
      {label}
    </span>
  </div>
);

export default ChatDateSeparator;
