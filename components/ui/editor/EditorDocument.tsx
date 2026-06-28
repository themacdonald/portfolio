interface EditorDocumentProps {
    id: string;
    children: React.ReactNode;
}

export default function EditorDocument({
    id,
    children,
}: EditorDocumentProps) {
    return (
        <section
            id={id}
            className="scroll-mt-16 pb-24"
        >
            {children}
        </section>
    );
}