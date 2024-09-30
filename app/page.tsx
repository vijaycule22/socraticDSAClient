'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import axios from 'axios';

import Editor from '@monaco-editor/react';
import { Badge } from "@/components/ui/badge"
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


import { AlertCircle, Brain, ChevronLeft, ChevronRight, CloudUpload, Play } from 'lucide-react';


import { Skeleton } from "@/components/ui/skeleton"


import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Navbar from './Navbar';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import LeftMenu from './LeftMenu';
import { CodeBlock } from './CodeBlock';
import ChatMenu from './ChatMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Item } from '@radix-ui/react-select';




type language = {
  name: string;
  id: string;
}

interface Message {
  role: 'user' | 'system'
  content: string
  read: boolean
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
  const [output, setOutput] = useState<any[]>([]);
  const [outputError, setOutputError] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState<language>(languages[0]); // State to store the selected language
  const [apiKeyInput, setApiKeyInput] = useState<string>('dc95dd8dc9mshf855b8e4af02affp1d0291jsn618623af494a');
  const [apiHostInput, setHostInput] = useState<string>('judge0-ce.p.rapidapi.com');
  const [baseURL, setBaseURL] = useState<string>('https://judge0-ce.p.rapidapi.com');
  const [Problems, setProblem] = useState([]);
  const [ProblemCaseStudy, setProblemCaseStudy] = useState<CaseStudy>();
  const [stdin, setStdin] = useState<any>();
  const [expected_output, setExpectedOutput] = useState<any>();
  // const baseURL = 'http://0.0.0.0:2358';
  //const baseURL = 'https://judge0-ce.p.rapidapi.com';
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [text_output, setTextOutput] = useState<string>('');
  const [code_output, setCodeOutput] = useState<string>('');
  const [arrayData, setArrayData] = useState<any>([]);
  const [judge0Response, setJudge0Response] = useState<Judge0Response>();
  const [testCasesInput, setTestCasesInput] = useState<any>([]);
  const [activeTab, setActiveTab] = useState("case 1");
  const [outputWindowSize, setOutputWindowSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [randomArray, setRandomArray] = useState<number[]>([]);
  const [SortedArray,setSortedArray] = useState<number[]>([]);
  let boilerPlateCode = `
import sys
import json
# Reading input from stdin
input_data = sys.stdin.read().splitlines()
# If there's only one line, parse that as a single test case
if len(input_data) == 1:
    nums = json.loads(input_data[0])
    print(sort_array(nums))
else:
    # Handle multiple test cases
    for line in input_data:
        nums = json.loads(line)
        print(sort_array(nums))
`;


  const sampleCode = `
  function sayHello() {
    console.log('Hello, world!');
  }
`;
  const errorRequest =
  {
    "messages": [
      {
        "role": "system",
        "content": "You are an AI assistant focused on teaching Data Structures and Algorithms, particularly sorting algorithms, using the Socratic method. Guide students to discover solutions through insightful, context-aware questioning rather than direct answers. Provide real-time feedback based on their code execution, personalize guidance to their understanding level, and encourage exploration and reflection. Always be patient, supportive, and focused on deepening their understanding through guided discovery.",
        "read": true
      },
      {
        "role": "user",
        "content": "File \"script.py\", line 1\n    name = input(@@@#$)\n                 ^\nSyntaxError: invalid syntax\n",
        "read": true
      },
    ]
  }

  useEffect(() => {
    GetProblemList();
   // GenerateRandomArray();
  }, []);


function seededRandom(seed:any) {
  // Linear Congruential Generator (LCG) constants
  const m = 0x80000000; // 2^31
  const a = 1103515245;
  const c = 12345;

  seed = (seed * a + c) % m;
  return seed / (m - 1);
}


// Function to create an array of random integers
function generateRandomArray(size:any, seed:any,min:any, max:any) {
  const randomArray = [];
  let currentSeed = seed;
  for (let i = 0; i < size; i++) {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff; // LCG formula
    const randomValue = min + (currentSeed % (max - min + 1)); // scale to desired range

    randomArray.push(Math.floor(seededRandom(seed + i) * 100)); // Generating integers between 0-99
  }
  return randomArray;
}

  // Function to dynamically close the sheet
  const closeSheet = () => {
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


  const onSubmitCode = async () => {
   
    await getTestcasesData("sort_an_array");
   // runCode(testCasesInput);
   await OnSubmitAsync(testCasesInput)
  
  };

  const OnSubmitAsync = async (allTestCases: any) => {
    try {
      setShowSkeleton(true);
      setOutput([]);
     

      if (allTestCases) {
        //setStdin(allTestCases);
      }

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
          stdin: stdin,
          expected_output: expected_output,
          cpu_time_limit: 1,
          cpu_extra_time: null,
          wall_time_limit: null,
          memory_limit: 12000,
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
        setOutputWindowSize(50);
        if(subResult)
          {
            if(subResult.status.description != 'Accepted')
            {
              if(expected_output == subResult.stdout)
              {
                console.log("All Test cases are succeed");
              }
              else{
                if(subResult.stdout !=null)
                {
                  let splitexpout = expected_output.split('\n');
                  let splitstdout = subResult.stdout.split('\n');
                  if(splitexpout[0] !=splitstdout[0])
                  {
                    console.log("Test case 1 is Failed")
                  }
                  else if(splitexpout[1] !=splitstdout[1])
                  {
                    console.log("Test case 2 is Failed")
                  }
                  else{
                    console.log("All Test cases are succeed");
                  }
                }
                else{
                  console.log(subResult.status.description)
                }
                
              }
            }
            else{
              console.log(subResult.status.description)
            }
          }
        

      }, 3000)
    } catch (error) {
      console.error('Error running code:', error);
    }
  };

 const GenerateRandomArray= async()=>{

  const seed = 10000;  // seed value
  const size = 100000;  // array size
  const min = -500;       // minimum value for random integers
  const max = 15000;     // maximum value for random integers
  const array = generateRandomArray(size, seed,min,max);
  const randomarrayAsString = array.join(" ");
  setRandomArray(array);
  const sorted = array.sort((a, b) => a - b); // For descending use: (b - a)
  setSortedArray(sorted);
  const arrayAsString = sorted.join(" ");
  const modifystdin = `2\n${randomarrayAsString}\n${randomarrayAsString}`;
  const modifyexspteced = `2\n${arrayAsString}\n${arrayAsString}`;
  setStdin(modifystdin);
  setExpectedOutput(modifyexspteced);
 }

 const getTestcasesData = async (testcase_name:any) => {
  testcase_name = 'sort_an_array';
  const response = await fetch(`https://socraticdsa-server.onrender.com/test_cases/problem/${testcase_name}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });
  const data = await response.json();
  console.log("testcase data",data);
  if(data.length>0)
  {
    const multistid = `${data.length}`;
     let modifystdin ='';
     let modifyexspteced ='';
    let input_paramsAsString='';
   
    data.forEach((element:any) => {
      
       if(element.input_params)
       {
        let inputarray = element.input_params.nums;
        input_paramsAsString = inputarray.join(" ");
        console.log("testcase data",input_paramsAsString)
        
      }
      
     const expected_resultAsString = element.expected_result;
       const sorted = expected_resultAsString.sort((a:any, b:any) => a - b); // For descending use: (b - a)
       const arrayAsString = sorted.join(" ");
      
        modifystdin += `\n${input_paramsAsString}`;
        modifyexspteced += `${arrayAsString}\n`;
    });
    let finalstid = `${multistid}${modifystdin}`;
    let finalexpected = `${modifyexspteced}`;
    

    // console.log("finalstid",finalstid);
    // console.log("finalexpected",finalexpected);

    handleStdinAndExpectedOutput(finalstid,finalexpected)
    // setStdin(undefined);
    // setExpectedOutput(undefined);

    // setStdin(finalstid);
    // setExpectedOutput(finalexpected);

  }
}

const handleStdinAndExpectedOutput = (finalstid:any,finalexpected:any) => {
  setStdin(undefined);
  setExpectedOutput(undefined);

  
  console.log("stdin",stdin)
  console.log("expected_output",expected_output)

  setStdin(finalstid); // Set new value
  setExpectedOutput(finalexpected);

  console.log("finalstid",stdin)
  console.log("finalexpected",expected_output)
};

  const runCode = async (allTestCases: any) => {
    try {
      setShowSkeleton(true);
      setOutput([]);
     

      if (allTestCases) {
        //setStdin(allTestCases);
      }

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
          stdin: stdin,
          expected_output: expected_output,
          cpu_time_limit: 1,
          cpu_extra_time: null,
          wall_time_limit: null,
          memory_limit: 12000,
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
        setJudge0Response(subResult);
        setOutputWindowSize(50);
        setOutput(subResult.stdout);
        setOutputError(subResult.stderr || subResult.message || subResult.compile_output);
        const isErrorExist = subResult.stderr || subResult.message || subResult.compile_output;
        if (isErrorExist?.length > 0) {
          errorRequest.messages[1].content = String(isErrorExist);
          openApiChat(errorRequest);
        }
        setShowSkeleton(false);
        if (subResult.stdout) {
          parseResponse(subResult);
        }

      }, 3000)
    } catch (error) {
      console.error('Error running code:', error);
    }
  };

  const apiInput = (event: any) => {
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

  const openApiChat = async (errorRequest: any) => {
    try {
      setIsLoading(true);
      const res = await axios.post('https://socraticdsa-server.onrender.com/openai-chat', errorRequest);
      setIsLoading(false);
      setChatMessages(prevMessages => [
        ...prevMessages,
        { role: 'system', content: res.data.text_output, read: false }
      ]);
      setTextOutput(res.data.text_output);
      setCodeOutput(res.data.code_output);
    }
    catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }


  const parseResponse = async (response: any) => {
    const stdout = response.stdout;
    const lines = stdout.split('\n'); // Split by newline

    console.log("lines:", lines);

    ProblemCaseStudy?.examples.map((testCase: any, id: any) => {
      testCase.result = lines[id];
    });
  }


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

      await OnSelectProblem(data[0].name);
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
      setOutputWindowSize(25);
      closeSheet();
      setJudge0Response(undefined);
      setStdin(undefined);
      setExpectedOutput(undefined);

      let problem = data?.examples;
      let inputArray: any[] = [];
      let outputArray: any[] = [];
      let prepareBoilerPlateCode: any;

      if (problem) {
        prepareBoilerPlateCode = data?.start || "";
        prepareBoilerPlateCode += `\n\n\n\n`;
        prepareBoilerPlateCode += data?.end || "";

        editorRef.current?.setValue(prepareBoilerPlateCode);


        problem.forEach((element: any) => {
          const input: any[] = element["custom_input"];
          const output: any[] = element["output"];

          setTestCasesInput((prev: any) => [...prev, input]);

          if (input.length > 1) {
            input.forEach((item: any) => {
              inputArray.push(item);
            });
          } else {
            inputArray.push(input[0]);
          }


          let myOutput = [output];
          if (Array.isArray(myOutput)) {
            outputArray.push(...myOutput);
          } else {
            outputArray.push(myOutput);
          }
        });


        let myResult = processInputArray(inputArray);

        let myOutput = processExpectedOutput(outputArray);

        // ProblemCaseStudy?.examples.map((testCase: any, id: any) => {
        //   testCase.expected_Result = myOutput;
        // });

        const result = `${problem.length}\n${myResult}`
        const outputwithsifix = `${myOutput}\n`;
        console.log("modified input for stdin", result);
        console.log("modified ouput for expected output:", outputwithsifix);
        

        setStdin(result);
        setExpectedOutput(outputwithsifix);

      }
      console.log("Problem details:", data);
    } catch (error) {
      console.error('Error fetching problem details:', error);
    }
  };


  function processInputArray(arr: any[]): string {
    // Ensure the input is an array
    if (!Array.isArray(arr)) {
      throw new TypeError('Input must be an array');
    }

    // Process each element
    return arr.map(item => {
      if (Array.isArray(item)) {
        return item.join(' ');
      }

      return String(item);
    }).join('\n');
  }


  function processExpectedOutput(arrays: any[]): string {
    let parsedArrays = arrays.map(arr => arr.replace(/[\[\]]/g, '').split(',').map(Number));
    // Replace the last element of the second array (index 1) with 5
    if (parsedArrays[1]) {
      parsedArrays[1][parsedArrays[1].length - 1] = 10;
    }
    // return parsedArrays.map((arr: any) =>
    //   arr.replace(/[\[\],]/g, ' ').trim().replace(/\s+/g, ' ')
    // ).join('\n');
    return parsedArrays.map(arr =>
      arr.join(' ').trim()
    ).join('\n');
  }

  function reverseOutResult(line: any) {
    //if line has number with space in between \n do below code if not return line
    if (!line.includes(' ')) {
      return line
    }
    // Split the line into an array of numbers
    const numbers = line.split(' ').filter((num: any) => num); // Filter out any empty strings
    // Join the numbers with commas and wrap in brackets
    return `[${numbers.join(',')}]`;
  }


  const handleChatMenuOpen = () => {
    setIsChatOpen(true)
    // setMessages(messages.map(m => ({ ...m, read: true })))
  }

  const handleChatMenuClose = () => {
    setIsChatOpen(false)
  }

  const handleSendMessage = (inputMessage: string) => {
    if (inputMessage.trim()) {
      setChatMessages(prevMessages => [
        ...prevMessages,
        { role: 'user', content: inputMessage, read: true }
      ]);

      // Call openApiChat when user sends a message
      errorRequest.messages.push(...chatMessages, { role: 'user', content: inputMessage, read: true });
      openApiChat(errorRequest);
    }
  }



  return (
    <div>

      <Navbar onApiKeyInputChange={apiInput} />
      <div className='px-3 py-1 flex body-height'>
        <ResizablePanelGroup direction="horizontal" className='rounded-xl'>

          <ResizablePanel defaultSize={45} className='rounded-xl border'>

            <div className='bg-zinc-800 p-1 border-b flex items-center'>
              <LeftMenu problemList={Problems} selectedProblem={ProblemCaseStudy} onProblemSelect={OnSelectProblem} />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className='ml-2 mr-1 text-muted-foreground' variant="outline">
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
                    <Button variant="outline" className='text-muted-foreground'>
                      <ChevronRight />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" >
                    <span>Next Question</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div>
              </div>
            </div>

            {ProblemCaseStudy != null ? (

              <div className='bg-background p-4  round  overflow-auto scroll-height border-b' key={ProblemCaseStudy?.name}>

                <div className="space-y-4 ">
                  <div className="flex justify-between items-center">

                    <h1 className="text-2xl font-bold text-foreground">{ProblemCaseStudy?.custom_name}
                    </h1>
                    <Badge variant={'outline'}
                      className={ProblemCaseStudy.difficulty === 'Easy' ? 'bg-muted text-green-600  ml-2 h-8 px-4' :
                        ProblemCaseStudy.difficulty === 'Medium' ? 'bg-muted text-yellow-600  ml-2 h-8 px-4' : 'bg-muted text-red-600  ml-2 px-4 h-8'}
                    >
                      {ProblemCaseStudy.difficulty}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground"><em>{ProblemCaseStudy?.description}</em></p>

                </div>

                <div className="mt-4 space-y-4">

                  <h2 className="text-xl font-bold text-foreground">Example</h2>

                  {ProblemCaseStudy.examples.map((example: any, id) => (

                    <div key={id} className="bg-muted p-4 rounded-md">

                      <p className="text-muted-foreground">

                        <strong>Input:</strong> <code>{example.input}</code>

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

                  <h2 className="text-xl font-bold text-foreground">Constraints</h2>

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
              <div className='bg-background p-4  round h-full'>

                <Skeleton className="h-[40px] w-[80%] rounded-xl mb-4" />
                <Skeleton className="h-[15px] w-[50%] rounded-xl mb-1" />
                <Skeleton className="h-[15px] w-[50%] rounded-xl mb-6" />

                <Skeleton className="h-[30px] w-[100px] rounded-xl mb-4" />

                <Skeleton className="h-[120px] w-full rounded-xl mb-2" />
                <Skeleton className="h-[120px] w-full rounded-xl mb-4" />

                <Skeleton className="h-[30px] w-[100px] rounded-xl mb-2" />
                <Skeleton className="h-[16px] w-[250px] rounded-xl mb-4" />
                <Skeleton className="h-[16px] w-[250px] rounded-xl mb-4" />
                <Skeleton className="h-[16px] w-[250px] rounded-xl mb-4" />
                <Skeleton className="h-[16px] w-[250px] rounded-xl mb-4" />

              </div>
            )}
          </ResizablePanel>


          <ResizableHandle className='px-1 bg-zinc-950' withHandle />


          <ResizablePanel defaultSize={55} className='rounded-xl '>



            <div className='border bg-zinc-800 text-muted-foreground '>
              <div className='p-1 border flex'>
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
            </div>
            <ResizablePanelGroup direction="vertical" >
              <ResizablePanel className=' border' defaultSize={75} minSize={20}>
                <Editor
                  className='editor'
                  defaultLanguage="python"
                  theme='vs-dark'
                  onMount={(editor) => (editorRef.current = editor)} />
              </ResizablePanel>

              <div className='flex justify-end rounded-bl-xl rounded-br-xl p-1 pr-4  gap-2 bg-zinc-800 border'>
                <Button onClick={runCode} variant="outline"><Play size={'16px'} className='mr-2 ' />Run</Button>
                <Button onClick={onSubmitCode} variant="outline" className='bg-muted'><CloudUpload size={'16px'} className='mr-2 ' />Submit</Button>
              </div>
              <ResizableHandle className='py-1 bg-zinc-950' withHandle onDragging={() => setOutputWindowSize(20)} />
              <ResizablePanel className='rounded-xl border' minSize={outputWindowSize} defaultSize={25} >
                <div className='bg-background text-muted-foreground py-2 px-4  h-full overflow-auto'>


                  {showSkeleton &&
                    <div>
                      <Skeleton className="h-[20px] w-[180px] rounded-xl m-2" />
                      <Skeleton className="h-[150px] w-[full] rounded-xl m-2" />
                    </div>
                  }

                  {(output?.length > 0 && !showSkeleton && judge0Response) && (
                    <div>
                      <div className="flex items-center mb-2 gap-2">   <h1 className={`${judge0Response?.status.description === 'Accepted' ? 'text-green-500' : 'text-orange-500'} text-xl`}
                      >{judge0Response?.status.description}</h1>
                        <span className='text-zinc-500 text-sm '>RunTime: {judge0Response?.time}</span></div>


                      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>

                        <TabsList>
                          {ProblemCaseStudy?.examples.map((problem: any, id: any) => (
                            <TabsTrigger value={`case ${id + 1}`} key={id}>
                              {reverseOutResult(problem?.result) == problem.output ? (<span className='h-[8px] w-[8px] mr-1 rounded-full bg-green-500'></span>) : (<span className='h-[8px] w-[8px] mr-1 rounded-full bg-red-500'></span>)}
                              case {id + 1}</TabsTrigger>
                          ))}
                        </TabsList>
                        {ProblemCaseStudy?.examples.map((testCase: any, id: any) => (
                          <TabsContent key={id} value={`case ${id + 1}`}>
                            <div>
                              <label className='text-zinc-500'>Input</label>
                              <div className='bg-muted rounded-lg w-full p-2 mt-1'>
                                {testCase.input}
                              </div>
                            </div>
                            <div>
                              <label className='text-zinc-500'>Output</label>
                              <div className='bg-muted rounded-lg w-full p-2 mt-1 mb-3'>
                                {reverseOutResult(testCase?.result)}
                              </div>
                            </div>
                            <div>
                              <label className='text-zinc-500'>Expected</label>
                              <div className='bg-muted rounded-lg w-full p-2 mt-1 mb-3'>
                                <div>
                                  {testCase.output}
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>



                    </div>)}


                  {(outputError?.length > 0 && !showSkeleton && judge0Response) && (
                    <>
                      <h1 className={`${judge0Response?.status.description === 'Accepted' ? 'text-green-500' : 'text-orange-500'} text-xl`}
                      >{judge0Response?.status.description}</h1>
                      <Alert variant="destructive" className='mb-4 bg-red-200'>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          <pre>{outputError}</pre>
                        </AlertDescription>
                      </Alert>
                      {/* {ProblemCaseStudy?.examples.map((testCase: any, id: any) => (

                        <div key={id}>
                          <label className='text-zinc-500'>Expected</label>
                          <div className='bg-muted rounded-lg w-full p-2 mt-1 mb-3'>
                            <div>
                              {testCase.output}
                            </div>
                          </div>
                        </div>

                      ))} */}
                      {ProblemCaseStudy?.examples.map((testCase: any, id: any) => (
                        id === 0 && ( // Render only for the first element
                          <div key={id}>
                            <label className='text-zinc-500'>Expected</label>
                            <div className='bg-muted rounded-lg w-full p-2 mt-1 mb-3'>
                              <div>
                                {testCase.output}
                              </div>
                            </div>
                          </div>
                        )
                      ))}
                    </>
                  )}

                </div>
              </ResizablePanel>

            </ResizablePanelGroup>

          </ResizablePanel>

        </ResizablePanelGroup>
      </div >

      {/* <ChatPopup /> */}
      < ChatMenu isOpen={isChatOpen} onOpen={handleChatMenuOpen} onClose={handleChatMenuClose} onSendMessage={handleSendMessage} recentResponseFromAi={text_output} isLoading={isLoading} messages={chatMessages} />
    </div >
  );
}

