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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Link, Settings } from 'lucide-react';





type language = {
  name: string;
  id: string;
}

interface Judge0Response {
  stdout: string;
  time: string;
  memory: number;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}


export default function Home() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [output, setOutput] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState<language>(languages[0]); // State to store the selected language
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // const baseURL = 'http://0.0.0.0:2358';
  //const baseURL = 'https://judge0-ce.p.rapidapi.com';


  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiHostInput, setHostInput] = useState<string>('');
  const [baseURL, setBaseURL] = useState<string>('');


  const handleApiKeyInputInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyInput(event.target.value);
  };

  const handleHostInputInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHostInput(event.target.value);
  };

  const handleBaseURLInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBaseURL(event.target.value);
  };


  const runCode = async () => {
    try {
      setOutput([]);
      const code = editorRef.current?.getValue() || '';
      const languageId = selectedLanguage?.id || '71';  // Default to Python 3 if no language selected

      const response = await fetch(`${baseURL}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': apiHostInput,
          'x-rapidapi-key': apiKeyInput
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          number_of_runs: null,
          stdin: "Judge0",
          expected_output: null,
          cpu_time_limit: null,
          cpu_extra_time: null,
          wall_time_limit: null,
          memory_limit: null,
          stack_limit: null,
          max_processes_and_or_threads: null,
          enable_per_process_and_thread_time_limit: null,
          enable_per_process_and_thread_memory_limit: null,
          max_file_size: null,
          enable_network: null
        }),
      });

      const result = await response.json();
      //wait for 3 sec and call another api
      setTimeout(async () => {
        const response: any = await fetch(`${baseURL}/submissions/${result.token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': apiHostInput,
            'x-rapidapi-key': apiKeyInput
          },
        });

        const subResult = await response.json();
        console.log(subResult);
        setOutput(subResult.stdout || subResult.stderr || subResult.compile_output || subResult.message);
        console.log(output);
      }, 3000)
    } catch (error) {
      console.error('Error running code:', error);
    }
  };




  const getLanguages = async () => {
    try {
      const response = await fetch(`${baseURL}/languages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': apiHostInput,
          'x-rapidapi-key': apiKeyInput
        },
      });


      const data = await response.json();
      setLanguages(data);
      if (data.length > 0) {
        setSelectedLanguage(data[0].id); // Set default selected language to the first in the list
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const handleLanguageChange = (value: any) => {
    const selectedLang = languages.find((lang: language) => lang.name === value);
    if (selectedLang) {
      setSelectedLanguage(selectedLang);
      console.log('Selected Language:', selectedLang);
    }
  };

  const handleConfDoneBtnClick = () => {
    console.log('Configuration Done');
    getLanguages();
    setIsPopoverOpen(false); // Close the Popover
  };

  useEffect(() => {

  }, []);



  return (
    <div>
      <header className="flex items-center justify-between bg-background text-foreground p-6 border-b border-input shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Socratic DSA</h1>
        </div>
        <nav className="flex items-center gap-4">

          <div className="text-sm font-medium hover:underline underline-offset-4" >
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline"><Settings className='mr-2' size={16} />Configure</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Rapid Api Configurations</h4>
                    <p className="text-sm text-muted-foreground">
                      Set the required fields.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-4">
                      <Label className='w-44' htmlFor="height">Base URL</Label>
                      <Input
                        value={baseURL}
                        onChange={handleBaseURLInputChange}
                        placeholder="Set base url here"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className='w-44' htmlFor="width">rapid API key</Label>
                      <Input
                        value={apiKeyInput}
                        onChange={handleApiKeyInputInputChange}
                        placeholder="Set rapidapi api key here"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className='w-44' htmlFor="maxWidth">rapid API Host</Label>
                      <Input
                        value={apiHostInput}
                        onChange={handleHostInputInputChange}
                        placeholder="Set rapidapi Api Host here"
                      />
                    </div>

                  </div>
                  <div className="flex justify-end">
                    <Button
                      className="w-24 "
                      onClick={handleConfDoneBtnClick}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </nav>
      </header>
      <div className='px-5 py-2'>


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
            <div className='border-2 bg-white border-slate-50 border-solid'>
              <div className='my-2 mx-1 flex'>
                <Select onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language: language) => (
                      <SelectItem key={language.id} value={language.name}>{language.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Editor
                height="500px"
                defaultLanguage="javascript"
                defaultValue={`// Write your ${selectedLanguage} code here`}
                onMount={(editor) => (editorRef.current = editor)}
              />
            </div>
            <div className='flex justify-end p-2 gap-2 bg-white m-2'>
              <Button onClick={runCode} variant="secondary">Run Code</Button>
              <Button>Submit</Button>

            </div>
            <div className='bg-white m-2 p-2'>
              <h3>Output:</h3>
              <pre>{output}</pre>
            </div>

          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

