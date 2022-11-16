function Header({ content }) {
  const { title, subtitle } = content
  return (
    <div className="flex flex-col p-6 bg-darky-200">
      <div className="text-greyish-100 font-bold">{title}</div>
      <div className="text-sm text-greyish-200">{subtitle}</div>
    </div>
  )
}

export default Header
