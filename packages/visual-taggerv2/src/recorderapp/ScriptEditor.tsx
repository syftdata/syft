import * as monaco from "monaco-editor";
import { Editor, loader } from "@monaco-editor/react";
import { useRef } from "react";

loader.config({ monaco });

export default function ScriptEditor({
  script,
  onEdit,
}: {
  script: string;
  onEdit: (script: string) => void;
}) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | undefined>();
  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    // here is the editor instance
    // you can store it in `useRef` for further usage
    editorRef.current = editor;
    editor.getAction("editor.foldLevel3")?.run();
  };
  return (
    <Editor
      height="550px"
      defaultLanguage="json"
      defaultValue={script}
      onMount={handleEditorDidMount}
      onChange={(val) => onEdit(val ?? "")}
      options={{
        lineNumbers: "off",
        scrollbar: { vertical: "hidden" },
        autoIndent: "full",
        automaticLayout: true,
        autoClosingBrackets: "always",
        minimap: { enabled: false },
      }}
    />
  );
}
