
export default function EmptyState({
  icon: Icon,
  iconNode,
  title,
  message,
  children,
  cardClassName = "glass-card rounded-3xl shadow-xl shadow-red-500/10 p-12 sm:p-16 text-center",
  className = "",
  iconWrapperClassName = "",
  iconClassName = "w-12 h-12 text-red-500",
  titleClassName = "text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2",
  messageClassName = "text-gray-500 dark:text-gray-400",
  bare = false,
}) {
  const content = (
    <div className={`empty-state ${className}`}>
      {(Icon || iconNode) && (
        <div className={`icon ${iconWrapperClassName}`}>
          {iconNode || (Icon && <Icon className={iconClassName} />)}
        </div>
      )}
      {title && <h3 className={titleClassName}>{title}</h3>}
      {message && <p className={messageClassName}>{message}</p>}
      {children}
    </div>
  );

  if (bare) return content;

  return <div className={cardClassName}>{content}</div>;
}
