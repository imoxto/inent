import { Dialog } from "@headlessui/react";
import { cloneElement, useState } from "react";

export function MyModal({
  button,
  children,
}: {
  button:
    | string
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  children: (modalProps: { closeModal: () => void }) => React.ReactNode;
}) {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="flex items-center justify-center">
        {typeof button !== "string" ? (
          cloneElement(button, {
            onClick: openModal,
          })
        ) : (
          <button
            type="button"
            onClick={openModal}
            className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
          >
            {button}
          </button>
        )}
      </div>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50"
        onClose={closeModal}
        open={isOpen}
      >
        <Dialog.Panel className="rounded-lg bg-gray-800 p-6 shadow-lg">
          {children({ closeModal })}
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
