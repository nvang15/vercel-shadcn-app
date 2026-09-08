"use client"

import { useEffect, useMemo, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { supabase } from "@/lib/supabase"

type TopicRow = Record<string, string | number | boolean | null>

function formatColumnName(column: string) {
  return column
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatValue(value: TopicRow[string]) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">No value</span>
  }

  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Yes" : "No"}
      </Badge>
    )
  }

  return String(value)
}

export default function Home() {
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchTopics() {
      setIsLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase.from("topics_data").select("*")

      if (!isMounted) {
        return
      }

      if (error) {
        setErrorMessage(error.message)
        setTopics([])
      } else {
        setTopics((data ?? []) as TopicRow[])
      }

      setIsLoading(false)
    }

    fetchTopics()

    return () => {
      isMounted = false
    }
  }, [])

  const columns = useMemo(
    () => Array.from(new Set(topics.flatMap((topic) => Object.keys(topic)))),
    [topics]
  )

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit">
              Supabase Dataset
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Topics Data
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                A live view of records fetched from the topics_data table.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="w-fit">
            {isLoading ? "Loading" : `${topics.length} records`}
          </Badge>
        </header>

        <Card className="rounded-lg">
          <CardHeader className="border-b">
            <CardTitle>Dataset Rows</CardTitle>
            <CardDescription>
              Columns are generated from the available Supabase fields.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center px-6 text-sm text-muted-foreground">
                Loading topics_data...
              </div>
            ) : errorMessage ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
                <Badge variant="destructive">Unable to load data</Badge>
                <p className="max-w-xl text-sm text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
            ) : topics.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center px-6 text-sm text-muted-foreground">
                No records found in topics_data.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    {columns.map((column) => (
                      <TableHead key={column} className="px-4 py-3">
                        {formatColumnName(column)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => (
                        <TableCell
                          key={`${rowIndex}-${column}`}
                          className="max-w-72 px-4 py-3 align-top"
                        >
                          <div className="whitespace-normal break-words">
                            {formatValue(topic[column])}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
