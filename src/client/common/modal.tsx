import { useRef, useEffect, cloneElement, useState } from "react";

type ModalProps = {
  button: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  children: (closeModal: () => void) => React.ReactNode;
};

const Modal = ({ button, children }: ModalProps) => {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {button &&
        cloneElement(button, { onClick: () => setShowModal(!showModal) })}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg" ref={modalRef}>
            {children(closeModal)}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
