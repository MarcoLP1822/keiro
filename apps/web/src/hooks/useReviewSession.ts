import { useState, useEffect, useCallback } from 'react';
import type { Exercise, SrsCard, SrsGrade } from '@keiro/types';
import {
  generateVocabExercises,
  generateKanjiExercises,
  generateGrammarExercises,
  gradeSrsCard,
  shuffle,
} from '@keiro/engine';
import {
  getModuleById,
  getVocabItems,
  getKanjiItems,
  getGrammarItems,
} from '@keiro/content';
import { storage } from '../services/storage';

interface ReviewExercise {
  exercise: Exercise;
  card: SrsCard;
}

export function useReviewSession(cardIds: string[]) {
  const [reviewExercises, setReviewExercises] = useState<ReviewExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (cardIds.length === 0) {
      setIsComplete(true);
      return;
    }

    async function loadCards() {
      const cards: SrsCard[] = [];
      for (const id of cardIds) {
        const card = await storage.getSrsCard(id);
        if (card) cards.push(card);
      }

      if (cards.length === 0) {
        setIsComplete(true);
        return;
      }

      const exercises: ReviewExercise[] = [];

      // Group cards by module for efficient exercise generation
      const cardsByModule = new Map<string, SrsCard[]>();
      for (const card of cards) {
        const existing = cardsByModule.get(card.moduleId) || [];
        existing.push(card);
        cardsByModule.set(card.moduleId, existing);
      }

      for (const [moduleId, moduleCards] of cardsByModule) {
        const mod = getModuleById(moduleId);
        if (!mod) continue;

        // Generate exercises for the whole module, then pick ones matching our cards
        let moduleExercises: Exercise[] = [];
        switch (mod.type) {
          case 'vocabulary':
            moduleExercises = generateVocabExercises(mod, getVocabItems());
            break;
          case 'kanji':
            moduleExercises = generateKanjiExercises(mod, getKanjiItems());
            break;
          case 'grammar':
            moduleExercises = generateGrammarExercises(mod, getGrammarItems());
            break;
        }

        // Match exercises to cards by their target item
        for (const card of moduleCards) {
          const matchingExercises = moduleExercises.filter((ex) => {
            const target = ex.targetItem as unknown as Record<string, unknown>;
            switch (mod.type) {
              case 'vocabulary':
                return String(target.word ?? '') === card.itemId;
              case 'kanji':
                return String(target.kanji ?? '') === card.itemId;
              case 'grammar':
                return String(target.id ?? '') === card.itemId;
              default:
                return false;
            }
          });

          // Pick 1 exercise per card (avoid overwhelming reviews)
          if (matchingExercises.length > 0) {
            exercises.push({
              exercise: matchingExercises[0],
              card,
            });
          }
        }
      }

      setReviewExercises(shuffle(exercises));
      setIsReady(exercises.length > 0);
      if (exercises.length === 0) setIsComplete(true);
    }

    loadCards();
  }, [cardIds]);

  const currentReview = reviewExercises[currentIndex] ?? null;
  const totalCount = reviewExercises.length;

  const handleGrade = useCallback(async (grade: SrsGrade) => {
    if (!currentReview) return;

    const updatedCard = gradeSrsCard(currentReview.card, grade);
    await storage.saveSrsCard(updatedCard);

    if (currentIndex + 1 >= reviewExercises.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentReview, currentIndex, reviewExercises.length]);

  return {
    currentExercise: currentReview?.exercise ?? null,
    currentIndex,
    totalCount,
    isReady,
    isComplete,
    handleGrade,
  };
}
