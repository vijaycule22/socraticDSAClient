'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';

import Editor from '@monaco-editor/react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"



export default function Home() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [output, setOutput] = useState([]);

  const runCode = async () => {
    try {
      let code = editorRef.current?.getValue() || '';
      console.log(code);
      const response = await fetch('https://socratic-dsa.vercel.app/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
        }),
      });

      const result = await response.json();
      setOutput(result.result);
    } catch (error) {
      console.error('Error running code:', error);
    }
  };


  return (
    <div className='p-10'>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <div className='bg-white p-4 mx-2 round'>
            <div className="space-y-4 ">
              <h1 className="text-3xl font-bold">Two Sum</h1>
              <p className="text-muted-foreground">
                Given an array of integers <code>nums</code> and an integer <code>target</code>, return{" "}
                <em>
                  indices of the two numbers such that they add up to <code>target</code>
                </em>
                .
              </p>
              <p className="text-muted-foreground">
                You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the{" "}
                <em>same element twice</em>.
              </p>
              <p className="text-muted-foreground">You can return the answer in any order.</p>
            </div>
            <div className="mt-4 space-y-4">
              <h2 className="text-xl font-bold">Example</h2>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-muted-foreground">
                  <strong>Input:</strong> <code>nums = [2, 7, 11, 15], target = 9</code>
                </p>
                <p className="text-muted-foreground">
                  <strong>Output:</strong> <code>[0, 1]</code>
                </p>
                <p className="text-muted-foreground">
                  <strong>Explanation:</strong> Because <code>nums[0] + nums[1] == 9</code>, we return <code>[0, 1]</code>.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <h2 className="text-xl font-bold">Constraints</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <code>2 &lt;= nums.length &lt;= 10^4</code>
                </li>
                <li>
                  <code>-10^9 &lt;= nums[i] &lt;= 10^9</code>
                </li>
                <li>
                  <code>-10^9 &lt;= target &lt;= 10^9</code>
                </li>
                <li>
                  <strong>Only one valid answer exists.</strong>
                </li>
              </ul>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <div className='border-2 border-slate-50 border-solid'>
            <Editor
              height="500px"
              defaultLanguage="javascript"
              defaultValue="// Write your javascript code here"
              onMount={(editor) => (editorRef.current = editor)}
            />
          </div>
          <div className='flex justify-end p-2 gap-2 bg-white m-2'>
            <Button onClick={runCode} variant="secondary">Run Code</Button>
            <Button  >Submit</Button>

          </div>
          <div className='bg-white m-2'>
            <h3>Output:</h3>
            <pre>{output}</pre>
          </div></ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

