import { Github, RefreshCw, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";

export default function Correct() {
    return (
        <Card className="w-2/7">
            <CardHeader>
                <CardTitle>Correct</CardTitle>
                <CardDescription>Good job!</CardDescription>
            </CardHeader>
            <CardContent>
                <p>You have completed the demo.</p>
            </CardContent>
            <CardFooter>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => window.location.reload()}><RefreshCw /></Button>
                    <Button variant="outline"><a href="https://github.com/CDX-1/learn2code"><Github /></a></Button>
                    <Button variant="outline"><a href="https://github.com/CDX-1"><UserRound /></a></Button>
                </div>
            </CardFooter>
        </Card>
    )
}