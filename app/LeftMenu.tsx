import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Problem = {
    id: number;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

type Props = {
    problemList: any[];
    selectedProblem: any;
    onProblemSelect: (problem: any) => void;
}

const problems: Problem[] = [
    { id: 1, title: "Two Sum", difficulty: "Easy" },
    { id: 2, title: "Add Two Numbers", difficulty: "Medium" },
    { id: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium" },
    { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard" },
    { id: 5, title: "Longest Palindromic Substring", difficulty: "Medium" },
    // Add more problems as needed
]

export default function LeftMenu(props: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredProblems = props.problemList.filter(problem =>
        problem.custom_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const closeSheet = () => {
        setIsOpen(false);
    };

    const onProblemSelectEvent = (problem: any) => {
        props.onProblemSelect(problem);
        closeSheet();
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className='text-muted-foreground'>
                    <Menu className="h-5 w-5 mr-2" />
                    <span >Toggle problem list</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-zinc-800">
                <SheetHeader>
                    <SheetTitle>Problems</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search problems"
                            className="flex-1 pl-8 mr-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="h-[calc(100vh-150px)] overflow-y-auto">
                        {filteredProblems.map((problem, id) => (
                            <div key={problem.name} className="py-2 border-b border-zinc-600">
                                <div className="flex justify-between items-center gap-3 cursor-pointer">
                                    <span className={`${props.selectedProblem == problem.name ? 'text-indigo-600' : 'text-muted-foreground'}`} onClick={() => onProblemSelectEvent(problem.name)}>{id + 1}. {problem.custom_name}</span>
                                    <Badge
                                        variant={problem.difficulty === 'Easy' ? 'secondary' :
                                            problem.difficulty === 'Medium' ? 'default' : 'destructive'}
                                    >
                                        {problem.difficulty}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}