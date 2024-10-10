"use client"
import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function QuranChap() {
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [chapterContent, setChapterContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredChapter, setHoveredChapter] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const versesPerPage = 10

  useEffect(() => {
    fetchChapters()
  }, [])

  const fetchChapters = async () => {
    try {
      const response = await fetch("http://api.alquran.cloud/v1/surah")
      if (!response.ok) {
        throw new Error("Failed to fetch chapters")
      }
      const data = await response.json()
      setChapters(data.data)
      setLoading(false)
    } catch (error) {
      setError("Failed to load chapters. Please try again later.")
      setLoading(false)
    }
  }

  const fetchChapterContent = async (chapterNumber) => {
    setLoading(true)
    try {
      const response = await fetch(`http://api.alquran.cloud/v1/surah/${chapterNumber}/en.asad`)
      if (!response.ok) {
        throw new Error("Failed to fetch chapter content")
      }
      const data = await response.json()
      setChapterContent(data.data)
      setCurrentPage(1)
      setLoading(false)
    } catch (error) {
      setError("Failed to load chapter content. Please try again later.")
      setLoading(false)
    }
  }

  const handleCardClick = (chapter) => {
    setSelectedChapter(chapter)
    fetchChapterContent(chapter.number)
  }

  const handleCloseModal = () => {
    setSelectedChapter(null)
    setChapterContent(null)
  }

  const handleCardHover = (chapter) => {
    setHoveredChapter(chapter)
  }

  const handleCardLeave = () => {
    setHoveredChapter(null)
  }

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil(chapterContent.numberOfAyahs / versesPerPage)))
  }

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
  }

  if (loading && chapters.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error && chapters.length === 0) {
    return <div className="text-center text-red-500">{error}</div>
  }

  const indexOfLastVerse = currentPage * versesPerPage
  const indexOfFirstVerse = indexOfLastVerse - versesPerPage
  const currentVerses = chapterContent?.ayahs.slice(indexOfFirstVerse, indexOfLastVerse) || []

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Quranic Chapters</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {chapters.map((chapter) => (
          <TooltipProvider key={chapter.number}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className="cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:bg-primary-50"
                  onClick={() => handleCardClick(chapter)}
                  onMouseEnter={() => handleCardHover(chapter)}
                  onMouseLeave={handleCardLeave}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold mb-2 transition-colors duration-300 ease-in-out group-hover:text-primary">{chapter.number}</div>
                    <div className="text-xl mb-1 transition-colors duration-300 ease-in-out group-hover:text-primary-600">{chapter.name}</div>
                    <div className="text-lg mb-1 transition-colors duration-300 ease-in-out group-hover:text-primary-700">{chapter.englishName}</div>
                    <div className="text-sm text-gray-600 transition-colors duration-300 ease-in-out group-hover:text-primary-800">{chapter.numberOfAyahs} verses</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>{chapter.englishNameTranslation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <Dialog open={selectedChapter !== null} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : chapterContent ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {chapterContent.englishName} ({chapterContent.name})
                </DialogTitle>
                <DialogDescription>
                  Chapter {chapterContent.number} - {chapterContent.numberOfAyahs} verses
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">English Translation:</h3>
                  {currentVerses.map((ayah, index) => (
                    <p key={ayah.number} className="text-sm mb-2">
                      {indexOfFirstVerse + index + 1}. {ayah.text}
                    </p>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button onClick={handlePrevPage} disabled={currentPage === 1}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <span>
                    Page {currentPage} of {Math.ceil(chapterContent.numberOfAyahs / versesPerPage)}
                  </span>
                  <Button onClick={handleNextPage} disabled={indexOfLastVerse >= chapterContent.numberOfAyahs}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
          <Button className="mt-4" onClick={handleCloseModal}>
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}