interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
  wide?: boolean;
}

export function Container({ children, className = "", as: Tag = "div", wide = false }: ContainerProps) {
  return (
    <Tag className={`${wide ? "max-w-[1400px]" : "max-w-[1280px]"} mx-auto w-full section-pad ${className}`}>
      {children}
    </Tag>
  );
}
