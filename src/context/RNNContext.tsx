
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TransactionClassifier, getClassifier } from '@/lib/rnnService';
import { useFinancial } from '@/context/FinancialContext';
import { DEFAULT_CATEGORIES } from '@/context/FinancialContext';
import { toast } from 'sonner';

interface RNNContextType {
  classifier: TransactionClassifier | null;
  isModelTrained: boolean;
  isTraining: boolean;
  predictCategory: (description: string) => Promise<string>;
  trainModel: () => Promise<void>;
}

const RNNContext = createContext<RNNContextType | undefined>(undefined);

export const RNNProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { financialData } = useFinancial();
  const [classifier, setClassifier] = useState<TransactionClassifier | null>(null);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  // Initialize classifier
  useEffect(() => {
    const initClassifier = async () => {
      try {
        const classifier = getClassifier(DEFAULT_CATEGORIES);
        const loaded = await classifier.loadModel();

        if (loaded) {
          setIsModelTrained(true);
        } else if (financialData.transactions.length > 5) {
          // Automatically train if enough data exists
          await trainModelInternal(classifier);
        }

        setClassifier(classifier);
      } catch (error) {
        console.error('Error initializing classifier:', error);
      }
    };

    initClassifier();
  }, [financialData.transactions.length]);

  // Internal function to train model
  const trainModelInternal = async (classifierInstance: TransactionClassifier) => {
    try {
      setIsTraining(true);

      // Use ALL valid transactions
      const trainingData = financialData.transactions
        .filter(t => t.description && DEFAULT_CATEGORIES.includes(t.category))
        .map(t => ({
          description: t.description.trim(),
          category: t.category,
        }));

      if (trainingData.length < 3) {
        toast.error('Need at least 3 transactions to train the model');
        return;
      }

      console.log(`Training model with ${trainingData.length} transactions`);
      await classifierInstance.buildModel();
      await classifierInstance.trainModel(trainingData);
      await classifierInstance.saveModel();

      setIsModelTrained(true);
      toast.success('Model trained successfully!');
    } catch (error) {
      console.error('Error training model:', error);
      toast.error('Failed to train model');
    } finally {
      setIsTraining(false);
    }
  };

  // Public train trigger
  const trainModel = async () => {
    if (!classifier) return;
    await trainModelInternal(classifier);
  };

  // Predict a category
  const predictCategory = async (description: string): Promise<string> => {
    if (!classifier || !isModelTrained) {
      return 'Other';
    }

    try {
      return await classifier.predictCategory(description);
    } catch (error) {
      console.error('Prediction failed:', error);
      return 'Other';
    }
  };

  return (
    <RNNContext.Provider
      value={{
        classifier,
        isModelTrained,
        isTraining,
        predictCategory,
        trainModel,
      }}
    >
      {children}
    </RNNContext.Provider>
  );
};

export const useRNN = () => {
  const context = useContext(RNNContext);
  if (context === undefined) {
    throw new Error('useRNN must be used within a RNNProvider');
  }
  return context;
};

