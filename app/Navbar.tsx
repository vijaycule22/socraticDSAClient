import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent, PopoverPortal } from "@radix-ui/react-popover";
import { Label } from "@radix-ui/react-label";
import { Brain, Settings } from "lucide-react";
import { Input } from "@/components/ui/input"; // Adjust the import path according to your project structure
import { useEffect, useState } from "react";

type Props = {
  onApiKeyInputChange: (event: any) => void;
}


const Navbar = (props: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiHostInput, setHostInput] = useState<string>('');
  const [baseURL, setBaseURL] = useState<string>('');

  const handleApiKeyInputInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyInput(event.target.value);
    localStorage.setItem('apiKeyInput', event.target.value);
  };

  const handleHostInputInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHostInput(event.target.value);
    localStorage.setItem('apiHostInput', event.target.value);
  };


  const handleBaseURLInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBaseURL(event.target.value);
    localStorage.setItem('baseURL', event.target.value);
  };

  const handleConfDoneBtnClick = () => {
    console.log('Configuration Done');
    props.onApiKeyInputChange({
      data: {
        'apiKeyInput': apiKeyInput,
        'apiHostInput': apiHostInput,
        'baseURL': baseURL,
      },
    } as any);
    setIsPopoverOpen(false); // Close the Popover
  };

  useEffect(() => {
    setApiKeyInput(localStorage.getItem('apiKeyInput') || '');
    setHostInput(localStorage.getItem('apiHostInput') || '');
    setBaseURL(localStorage.getItem('baseURL') || '');
  }, []);



  return (
    <header className="flex items-center justify-between bg-background text-foreground p-4 border-b border-input shadow-sm">
      <div className="flex items-center gap-2">
        <Brain className="h-7 w-7" />
        <h1 className="text-2xl font-bold text-popover-foreground opacity-90">Socratic DSA.</h1>
      </div>
      <nav className="flex items-center gap-4">

        <div className="text-sm bg-zinc-800 text-foreground font-medium hover:underline underline-offset-4" >
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline"><Settings className='mr-2' size={16} />Configure</Button>
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent side="bottom" align="end" className="w-96 bg-zinc-800 shadow-xl px-4 py-4 rounded-lg mt-2">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground leading-none">Rapid Api Configurations</h4>
                    <p className="text-sm text-muted-foreground">
                      Set the required fields.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-4">
                      <Label className='w-52 text-muted-foreground' htmlFor="height">Base URL</Label>
                      <Input className="w-full mr-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-50"
                        value={baseURL}
                        onChange={handleBaseURLInputChange}
                        placeholder="Set base url here"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className='w-52 text-muted-foreground' htmlFor="width">rapid API key</label>
                      <Input className="w-full mr-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-50"
                        value={apiKeyInput}
                        type="password"
                        onChange={handleApiKeyInputInputChange}
                        placeholder="Set rapidapi api key here"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className='w-52 text-muted-foreground' htmlFor="apiHost">rapid API Host</Label>
                      <Input className="w-full mr-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-50"
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
            </PopoverPortal>
          </Popover>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;