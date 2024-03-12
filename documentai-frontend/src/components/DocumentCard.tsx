
interface Props {
    imageUrl: string
}

const DocumentCard = ({imageUrl}: Props) => {
  return (
    <div className="max-w-xlg rounded overflow-hidden shadow-lg">
    <img className="w-full" src={imageUrl} alt="Sunset in the mountains" />
    <div className="px-6 py-4">
      <div className="font-bold text-xl mb-2">The Coldest Sunset</div>
    </div>
  </div>
  )
}

export default DocumentCard