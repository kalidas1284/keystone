import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function PageContainer({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-100">
      {children}
    </div>
  );
}

export default PageContainer;