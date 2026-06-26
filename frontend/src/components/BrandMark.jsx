import { FaHeart } from 'react-icons/fa6'

export default function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <FaHeart className="brand-mark__heart" />
      <span className="brand-mark__plus">+</span>
    </span>
  )
}
