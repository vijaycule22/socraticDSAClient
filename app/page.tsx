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
import { AlertCircle, Brain, ChevronLeft, ChevronRight, Link, ListPlus, Settings, Terminal } from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Navbar from './Navbar';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ChatPopup from './ChatMenu';







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

interface CaseStudy {
  name: string,
  custom_name: string,
  difficulty: string,
  description: string,
  examples: [],
  constraints: []
}


export default function Home() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [output, setOutput] = useState([]);
  const [outputError, setOutputError] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState<language>(languages[0]); // State to store the selected language
  const [apiKeyInput, setApiKeyInput] = useState<string>('7006c9c5b7msh60296f977a3f028p100fc6jsnde78de91aa45');
  const [apiHostInput, setHostInput] = useState<string>('judge0-ce.p.rapidapi.com');
  const [baseURL, setBaseURL] = useState<string>('https://judge0-ce.p.rapidapi.com');
  const [Problems, setProblem] = useState([]);
  const [ProblemCaseStudy, setProblemCaseStudy] = useState<CaseStudy>();
  // const baseURL = 'http://0.0.0.0:2358';
  //const baseURL = 'https://judge0-ce.p.rapidapi.com';
  const [isOpen, setIsOpen] = useState(false);


  // Function to dynamically close the sheet
  const closeSheet = () => {
    console.log('Sheet closed');
    setIsOpen(false);
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
        setOutput(subResult.stdout);
        setOutputError(subResult.stderr || subResult.message);
        console.log(output);
      }, 3000)
    } catch (error) {
      console.error('Error running code:', error);
    }
  };

  const apiInput = (event: any) => {
    console.log(event)
    setBaseURL(event.data.baseURL);
    setApiKeyInput(event.data.apiKeyInput);
    setHostInput(event.data.apiHostInput);
    getLanguages();
  }

  const handleLanguageChange = (value: any) => {
    const selectedLang = languages.find((lang: language) => lang.name === value);
    if (selectedLang) {
      setSelectedLanguage(selectedLang);
      console.log('Selected Language:', selectedLang);
    }
  };


  const GetProblemList = async () => {
    try {
      const response = await fetch(`https://socraticdsa-server.onrender.com/fetch-all-problems`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      setProblem(data);
      console.log("problems:" + data)

      OnSelectProblem(data[0].name);
    } catch (error) {
      console.error('Error fetching ProblemsList:', error);
    }
  };

  const OnSelectProblem = async (problemName: string) => {
    try {
      console.log("Problem name:", problemName);
      const response = await fetch(`https://socraticdsa-server.onrender.com/problems/${problemName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProblemCaseStudy(data);
      closeSheet();

      console.log("Problem details:", ProblemCaseStudy);
    } catch (error) {
      console.error('Error fetching problem details:', error);
    }
  };


  useEffect(() => {
    GetProblemList();
  }, []);



  return (
    <div>

      <Navbar onApiKeyInputChange={apiInput} />
      <div className='px-5 py-2 flex body-height'>
        <ResizablePanelGroup direction="horizontal">

          <ResizablePanel>

            <div className='bg-white p-2 mb-1'>

              <div>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>

                  <SheetTrigger asChild>

                    <Button variant="outline"><ListPlus className='mr-1' />Problems</Button></SheetTrigger>

                  <SheetContent side={"left"}>

                    <SheetHeader>

                      <SheetTitle>

                        <h1 className="text-2xl font-bold text-gray-700 mb-6">Problem List</h1>

                      </SheetTitle>



                      {Problems.map((problem: any) => (
                        <div key={problem.name} className={` shadow-md rounded-lg py-3 px-3 mb-4 cursor-pointer `}>

                          <div className="flex justify-between items-center">

                            <div onClick={() => OnSelectProblem(problem.name)}>

                              <div className={`text-sm font-semibold  ${ProblemCaseStudy?.name == problem.name ? 'text-indigo-600' : 'text-black-600'}`}>

                                {problem.custom_name}
                              </div>
                            </div>
                            <div>
                              <span className="bg-green-100 text-green-600 text-sm font-medium px-2 py-1 rounded-full">

                                {problem.difficulty}

                              </span>
                            </div>
                          </div>

                        </div>
                      ))}



                    </SheetHeader>

                  </SheetContent>

                </Sheet>
                <TooltipProvider>

                  <Tooltip>

                    <TooltipTrigger asChild>

                      <Button className='ml-2 mr-1' variant="outline">

                        <ChevronLeft />

                      </Button>

                    </TooltipTrigger>

                    <TooltipContent side="bottom" >

                      <span>Prev Question</span>

                    </TooltipContent>

                  </Tooltip>

                </TooltipProvider>



                <TooltipProvider>

                  <Tooltip>

                    <TooltipTrigger asChild>

                      <Button variant="outline" >

                        <ChevronRight />

                      </Button>

                    </TooltipTrigger>

                    <TooltipContent side="bottom" >

                      <span>Next Question</span>

                    </TooltipContent>

                  </Tooltip>

                </TooltipProvider>
              </div>
            </div>

            {ProblemCaseStudy != null ? (

              <div className='bg-white p-4  round h-full' key={ProblemCaseStudy?.name}>

                <div className="space-y-4 ">

                  <h1 className="text-3xl font-bold">{ProblemCaseStudy?.custom_name}</h1>

                  <p className="text-muted-foreground"><em>{ProblemCaseStudy?.description}</em></p>

                </div>

                <div className="mt-4 space-y-4">

                  <h2 className="text-xl font-bold">Example</h2>

                  {ProblemCaseStudy.examples.map((example: any, id) => (

                    <div key={id} className="bg-muted p-4 rounded-md">

                      <p className="text-muted-foreground">

                        <strong>Input:</strong><code>{example.input}</code>

                      </p>

                      <p className="text-muted-foreground">

                        <strong>Output:</strong> <code>{example.output}</code>

                      </p>

                      <p className="text-muted-foreground">

                        <strong>Explanation:</strong> {example.explanation}

                      </p>

                    </div>

                  ))}

                </div>

                <div className="mt-4 space-y-4">

                  <h2 className="text-xl font-bold">Constraints</h2>

                  {ProblemCaseStudy.constraints.map((constraints: any, id) => (

                    <ul key={id} className="list-disc pl-6 space-y-2 text-muted-foreground">

                      <li>

                        <code>{constraints}</code>

                      </li>

                    </ul>

                  ))}

                </div>

              </div>

            ) : (

              <p>No case studies available</p>

            )}



          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
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

                    onMount={(editor) => (editorRef.current = editor)} />

                </div>


              </ResizablePanel>
              <ResizableHandle />
              <div className='flex justify-end p-2 gap-2 bg-white mb-1'>

                <Button onClick={runCode} variant="secondary">Run Code</Button>

                <Button>Submit</Button>



              </div>

              <ResizablePanel>
                <div className='bg-white p-2 h-full'>

                  <h3>Output:</h3>
                  {outputError?.length > 0 && (
                    <>
                      <Alert variant="destructive" className='mb-4'>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          <pre>{outputError}</pre>
                        </AlertDescription>
                      </Alert>

                      <Alert>
                        <Brain className="h-4 w-4" />
                        <AlertTitle>AI Help!</AlertTitle>
                        <AlertDescription>
                          To fix the error, change console.logs
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                  {output?.length > 0 && (<div className='bg-white p-4'>
                    <pre>{output}
                    </pre>
                  </div>)}


                </div>
              </ResizablePanel>

            </ResizablePanelGroup>

          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

      <ChatPopup />
    </div>
  );
}

