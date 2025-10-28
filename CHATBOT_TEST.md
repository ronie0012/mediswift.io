# MediSwift Chatbot Medicine Feature Test Guide

## Overview
This document provides test cases to verify the enhanced medicine-related functionality in the MediSwift chatbot.

## Test Cases

### 1. Symptom-Based Medicine Recommendations
**Test Input:** "I have a headache"
**Expected Response:** Information about headache treatment including:
- General information about headaches
- List of common medicines (Paracetamol, Aspirin, Ibuprofen)
- Dosage information for each medicine
- Price ranges
- Disclaimer about consulting healthcare professionals

### 2. Specific Medicine Information
**Test Input:** "What is Paracetamol used for?"
**Expected Response:** Detailed information about Paracetamol including:
- Uses (pain relief, fever reduction)
- Dosage instructions
- Price information
- Available products in the store

### 3. Antibiotic Information
**Test Input:** "Do I need antibiotics for a cold?"
**Expected Response:** Educational information about:
- When antibiotics are appropriate
- Why they don't work for viral infections
- Recommendation to consult healthcare provider

### 4. Heart Medication Information
**Test Input:** "What medicines are good for blood pressure?"
**Expected Response:** Information about heart and blood pressure medications:
- Common medications (Amlodipine, Atorvastatin)
- Usage information
- Important note about medical supervision

### 5. Digestive Health Information
**Test Input:** "I have acid reflux"
**Expected Response:** Information about digestive health:
- Common medications (Omeprazole, Pantoprazole)
- Usage instructions
- Lifestyle recommendations

### 6. Allergy Treatment Information
**Test Input:** "What can I take for allergies?"
**Expected Response:** Information about allergy treatments:
- Antihistamines (Cetirizine, Levocetirizine)
- Other treatments (Montelukast)
- Usage instructions

## Testing Instructions

1. Start the MediSwift application
2. Log in as a registered user
3. Open the chat widget by clicking the chat icon in the bottom right
4. Enter each test input and verify the response matches the expected output
5. Check that medicine information includes:
   - Medicine names
   - Usage information
   - Dosage instructions
   - Price ranges
   - Proper disclaimers

## Expected Enhancements

The enhanced chatbot should now provide:
- More comprehensive medicine information
- Better organization of medicine recommendations
- Price information for medicines
- Clear disclaimers about medical consultation
- Improved formatting of responses
- Support for more symptom categories