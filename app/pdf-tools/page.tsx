"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PDFCompressor } from "./components/PDFCompressor"
import { PDFConverter } from "./components/PDFConverter"
import { PDFEditor } from "./components/PDFEditor"
import { PDFMerger } from "./components/PDFMerger"
import { PDFSeparator } from "./components/PDFSeparator"

export default function PDFToolsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">PDF Tools</h1>

      <Tabs defaultValue="merge" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="merge">Merge PDFs</TabsTrigger>
          <TabsTrigger value="separate">Separate PDF</TabsTrigger>
          <TabsTrigger value="compress">Compress PDF</TabsTrigger>
          <TabsTrigger value="edit">Edit PDF</TabsTrigger>
          <TabsTrigger value="convert">Convert PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="merge">
          <Card>
            <CardHeader>
              <CardTitle>Merge PDFs</CardTitle>
              <CardDescription>
                Combine multiple PDF files into one document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFMerger />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="separate">
          <Card>
            <CardHeader>
              <CardTitle>Separate PDF</CardTitle>
              <CardDescription>
                Split a PDF into multiple documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFSeparator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compress">
          <Card>
            <CardHeader>
              <CardTitle>Compress PDF</CardTitle>
              <CardDescription>
                Reduce PDF file size while maintaining quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFCompressor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit PDF</CardTitle>
              <CardDescription>
                Add pages and modify your PDF document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convert">
          <Card>
            <CardHeader>
              <CardTitle>Convert PDF</CardTitle>
              <CardDescription>
                Convert your PDF to Word, Excel, PowerPoint, or Image formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFConverter />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
