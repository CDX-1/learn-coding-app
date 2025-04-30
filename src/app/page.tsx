"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Editor, { EditorRef } from "@/components/ui/editor";
import { HoverCard, HoverCardContent } from "@/components/ui/hover-card";
import Output, { OutputRef } from "@/components/ui/output";
import { HoverCardTrigger } from "@radix-ui/react-hover-card";
import { ArrowRight, Book, HelpCircle, PlayIcon, TriangleAlert } from "lucide-react";
import Correct from "@/components/ui/correct";
import InlineCode from "@/components/inline-code";
import CodeBlock from "@/components/code-block";

export default function Home() {
	const editorRef = useRef<EditorRef>(null);
	const outputRef = useRef<OutputRef>(null);

	const [isCorrect, setCorrect] = useState(false);
	const [isComplete, setComplete] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isQuizMode, setQuizMode] = useState(false);

	const run = () => {
		if (editorRef.current == null) return;
		editorRef.current.run();
		setTimeout(() => check(), 1);
	};

	const validator = (code: string, output: any[], num: number) => code.includes("10") && code.includes("5") && code.includes("=") && code.includes("+") && output.includes(num);

	const check = () => {
		if (editorRef.current == null) return;
		if (outputRef.current == null) return;

		const code = editorRef.current.getCode();
		const output = outputRef.current.getOutput();

		setCorrect(validator(code, output, 15));
	};

	const takeQuiz = () => {
		setQuizMode(true);
	};

	const complete = () => {
		setComplete(true);
	};

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="flex items-center justify-center w-full h-screen">
			{isMobile ? (
				<div className="flex flex-col items-center">
					<TriangleAlert className="scale-150" />
					<p className="pt-4 pb-2 text-center">Window Size is Unsupported</p>
					<p className="w-3/4 text-center">
						Do note that this is a demo and is not intended
						to support varying window sizes.
					</p>
				</div>
			) : !isComplete ? (
				<div className="flex items-center justify-center w-full h-screen">
					{isQuizMode ? (
						<Card className="w-2/5">
							<CardHeader>
								<CardTitle>Write a program that uses two variables to calculate the sum of 5 and 10</CardTitle>
								<CardDescription>Ensure you actually performs the mathematical operations in the code.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex-col space-y-4">
									<div className="space-y-2">
										<h3 className="font-mono">Editor</h3>
										<Editor ref={editorRef} />
									</div>
									<div className="space-y-2">
										<h3 className="font-mono">Output</h3>
										<Output ref={outputRef} />
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<div className="flex justify-between w-full">
									<div className="flex space-x-4">
										<Button onClick={() => run()} variant="outline"><PlayIcon />Run</Button>
										{isCorrect && <Button onClick={() => complete()}><ArrowRight />Continue</Button>}
									</div>
									<Button variant="link"><HelpCircle />
										<HoverCard>
											<HoverCardTrigger asChild>
												<p className="hidden lg:block">Need help?</p>
											</HoverCardTrigger>
											<HoverCardContent className="w-1/2">
												<div className="flex-col space-y-2">
													<div className="flex space-x-1"><Book className="py-1" /><p><b>Help</b></p></div>
													<p>
														In JavaScript, you can add numbers by using <code>+</code> operator.
													</p>
													<CodeBlock text={`let a = 7\nlet b = 8\nlet c = a + b`} />
												</div>
											</HoverCardContent>
										</HoverCard>
									</Button>
								</div>
							</CardFooter>
						</Card>
					) : (
						<Card className="w-2/5">
							<CardHeader>
								<CardTitle>Variables</CardTitle>
								<CardDescription>Storing values</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="pb-2">
									In programming, variables are a way to store values with an identifier.
								</p>
								<InlineCode text="let a = 4" className="py-2" />
								<p className="py-2">
									You can perform mathematical operations on variables that are assigned to
									numeric values and model equations.
								</p>
								<CodeBlock text={`let a = 20\nlet b = 5\nlet c = a / b // Quotient of 20 and 5 is 4`} className="py-2" />
								<p className="py-2">
									You can then output the values of these variables to the console.
								</p>
								<CodeBlock text={`let a = 7\nlet b = 3\nlet c = a * b\nconsole.log(c)`} className="py-2" />
								<p className="py-2">
									This would output
								</p>
								<InlineCode text="21" className="py-2" />
							</CardContent>
							<CardFooter>
								<Button onClick={() => takeQuiz()}><ArrowRight />Take Quiz</Button>
							</CardFooter>
						</Card>
					)}
				</div>
			) : <Correct />}
		</div>
	);
}
