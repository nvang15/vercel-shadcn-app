"use client"

export const dynamic = 'force-dynamic';

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

type PokemonRow = {
  Num: number
  Name: string
  Type1: string
  Type2: string | null
  HP: number
  Attack: number
  Defense: number
  SpAtk: number
  SpDef: number
  Speed: number
  Generation: number
  Legendary: boolean
}

const statColumns = [
  "HP",
  "Attack",
  "Defense",
  "SpAtk",
  "SpDef",
  "Speed",
] as const

function getTypeBadgeVariant(type: string) {
  if (type === "Normal") {
    return "secondary"
  }

  if (["Poison", "Ghost", "Dark"].includes(type)) {
    return "outline"
  }

  return "default"
}

function getBaseStatTotal(pokemon: PokemonRow) {
  return statColumns.reduce((total, stat) => total + pokemon[stat], 0)
}

export default function Home() {
  const [pokemon, setPokemon] = useState<PokemonRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchPokemon() {
      setIsLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from("pokemon")
        .select(
          "Num, Name, Type1, Type2, HP, Attack, Defense, SpAtk, SpDef, Speed, Generation, Legendary"
        )
        .order("Num", { ascending: true })

      if (!isMounted) {
        return
      }

      if (error) {
        setErrorMessage(error.message)
        setPokemon([])
      } else {
        setPokemon((data ?? []) as PokemonRow[])
      }

      setIsLoading(false)
    }

    fetchPokemon()

    return () => {
      isMounted = false
    }
  }, [])

  const summary = useMemo(() => {
    const typeCount = new Set(
      pokemon.flatMap((entry) => [entry.Type1, entry.Type2]).filter(Boolean)
    ).size
    const legendaryCount = pokemon.filter((entry) => entry.Legendary).length
    const generations = new Set(pokemon.map((entry) => entry.Generation)).size

    return { typeCount, legendaryCount, generations }
  }, [pokemon])

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit">
              Supabase Pokemon
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Pokemon Dataset
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                A live view of names, types, combat stats, generations, and
                legendary flags fetched from the pokemon table.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="w-fit">
            {isLoading ? "Loading" : `${pokemon.length} pokemon`}
          </Badge>
        </header>

        {!isLoading && !errorMessage && pokemon.length > 0 ? (
          <section className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-lg" size="sm">
              <CardHeader>
                <CardDescription>Total Pokemon</CardDescription>
                <CardTitle className="text-2xl">{pokemon.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="rounded-lg" size="sm">
              <CardHeader>
                <CardDescription>Types Present</CardDescription>
                <CardTitle className="text-2xl">{summary.typeCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="rounded-lg" size="sm">
              <CardHeader>
                <CardDescription>Legendary Pokemon</CardDescription>
                <CardTitle className="text-2xl">
                  {summary.legendaryCount}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    across {summary.generations} generations
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          </section>
        ) : null}

        <Card className="rounded-lg">
          <CardHeader className="border-b">
            <CardTitle>Pokemon Stats</CardTitle>
            <CardDescription>
              Columns from Supabase: Num, Name, Type1, Type2, HP, Attack,
              Defense, SpAtk, SpDef, Speed, Generation, and Legendary.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center px-6 text-sm text-muted-foreground">
                Loading pokemon...
              </div>
            ) : errorMessage ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
                <Badge variant="destructive">Unable to load data</Badge>
                <p className="max-w-xl text-sm text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
            ) : pokemon.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center px-6 text-sm text-muted-foreground">
                No records found in pokemon.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="px-4 py-3">#</TableHead>
                    <TableHead className="min-w-44 px-4 py-3">Name</TableHead>
                    <TableHead className="min-w-40 px-4 py-3">Type</TableHead>
                    <TableHead className="px-4 py-3 text-right">HP</TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Attack
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Defense
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Sp. Atk
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Sp. Def
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Speed
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Total
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Gen
                    </TableHead>
                    <TableHead className="px-4 py-3">Legendary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pokemon.map((entry) => (
                    <TableRow key={`${entry.Num}-${entry.Name}`}>
                      <TableCell className="px-4 py-3 font-medium">
                        {entry.Num}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium">
                        {entry.Name}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant={getTypeBadgeVariant(entry.Type1)}>
                            {entry.Type1}
                          </Badge>
                          {entry.Type2 ? (
                            <Badge variant={getTypeBadgeVariant(entry.Type2)}>
                              {entry.Type2}
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      {statColumns.map((stat) => (
                        <TableCell
                          key={`${entry.Num}-${entry.Name}-${stat}`}
                          className="px-4 py-3 text-right tabular-nums"
                        >
                          {entry[stat]}
                        </TableCell>
                      ))}
                      <TableCell className="px-4 py-3 text-right font-medium tabular-nums">
                        {getBaseStatTotal(entry)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right tabular-nums">
                        {entry.Generation}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant={entry.Legendary ? "default" : "secondary"}
                        >
                          {entry.Legendary ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
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
