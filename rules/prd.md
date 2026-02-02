# **Timeline-Based Global News Platform PRD (MVP)**

---

## **Project Overview**

### **Item Introduction**

Organizes the latest global news chronologically, enabling users to quickly grasp the changes happening right now.


---

### **Vision**

Without having to read complex news, a situational awareness tool that lets you understand the world's changes at a glance.


---

## **Problem Recognition**

The volume of news is overwhelming, but the trends remain invisible.

- The pace of change across technology, industry, and science is accelerating dramatically,
    
    and dozens of news stories pour in daily.
    
- Users find it difficult to read all the news,
    
    **and they want to quickly understand "what is changing right now."**
    
- However, existing news services
    - are fragmented into individual articles,
    - making it hard to grasp context from headlines alone,
    - and it's hard to see changes across multiple fields as one flow.

**As a result...**

- News is consumed, but change remains unrecognized.
- Users either miss important trends or
    
    or feel overwhelmed by excessive information.
    

---

The entry cost to understand news is high.

- You must read the full article to grasp the core,
- and determining which news is important is left to the user.
- The more recent the news, the more lacking the background context, making it harder to understand.

**Consequently...**

- news consumption doesn't become habitual,
- pushed aside with "I'll read it later," and ultimately missed.

---

## **Solution**

### **Key Function**

**Key Function 1. Timeline-Based News Structure**

- All news **is sorted**and delivered **chronologically**
- **Information structure prioritizing the flow of time** over categories
- Users can grasp recent developments over the past few days with just a scroll

**Implementation Method**

- Global news crawling → Sorting based on publication time
- Maintains chronological order even within the same date

---

**Key Function 2. Change-Focused Summary Delivery**

- Provides **a short, concise summary**for each news item
- The summary focuses not on summarizing the article,
    
    **but focus on "what happened and why it matters"**
    

**Implementation Method**

- AI-generated summaries based on core article text
- Approximately 2-3 lines to minimize cognitive load
- Enables basic context understanding without clicking

---

**Key Function 3. Field-Specific Filtering**

- News is categorized into various fields, but
- sorting criteria are always time-based
- Users can selectively explore only their areas of interest

---

> **Key Function 4. Keyword Search**
> 
- Searches **news data already registered**in the service
- Simple and fast search based on title, summary, and keywords
- Search results **are** also **sorted chronologically**

**Implementation Method**

- Full-text search of external web ❌
- Internal news database-based keyword search ⭕
- Search results are sorted by recency

---

### **Service Focus**

> **Focus Point 1. Quick Comprehension**
> 
- News structure that can be understood without reading
- Understand the situation with just the title + summary
- Instant access without login or settings

> **Focus Point 2. Information Restraint**
> 
- Excludes excessive explanation, analysis, and opinion
- Focus on conveying changes rather than interpreting news
- In MVP, prioritize **information density management**over feature expansion

---

### **Service Flow**

News Crawling → Summary Generation → Timeline Sorting → User Exploration → Original Article Link

- Users immediately view the main timeline upon access
- Selectively view full articles only for news of interest
- Freely leave/revisit without separate accounts

---

## **Technology Development Plan**

### **Roadmap**

### **Phase 0: MVP Development (v1.0)**

1. **[Feature] Global News Crawling**
    - Multi-domain English news collection
    - Minimized Duplicate Articles
2. **[Feature] AI Summary Generation**
    - Concise summaries based on article essence
3. **[Feature] Timeline Sorting**
    - Main feed organized by latest updates
4. **[Feature] Category Filter**
    - Browse by Selecting Areas of Interest
5. **[Feature] Original Article Link**
    - Provides links to external articles

---

# **Feature Definition (MVP)**

## **1. Functional Requirements**

| **#** | **Classification** | **Function** | **Description** |
| --- | --- | --- | --- |
| 1 | Core | Global News Crawling | Collects English-language news across multiple fields including IT, AI, startups, science, design, and space |
| 2 | Core | News Refining | Removal of unnecessary advertising/duplicate articles |
| 3 | Core | AI Summary Generation | Automatically generates 2-3 line summaries based on core article text |
| 4 | Core | Timeline Sorting | Sort by latest publication date |
| 5 | Core | News Metadata Management | Manage title, date, summary, and source link |
| 6 | Support | Category Classification | Assign at least one category tag per news item |
| 7 | Support | Category Filtering | View only selected category news in the timeline |
| 8 | Support | Original Article Link | Click summary to go to external article link |
| 9 | Support | Search | Integrated search for keywords in titles, summaries, and categories |

---

## **2. Non-functional Requirements**

| **#** | **Classification** | **Function** | **Description** |
| --- | --- | --- | --- |
| 1 | Core | Processing Speed | Main timeline loading within 2 seconds |
| 2 | Core | Stability | Minimize disruptions in news collection and summarization pipelines |
| 3 | Core | Scalability | Scalable structure for categories and collection sources |
| 4 | Support | UX Consistency | Maintain consistent information density in news cards and summary structures |
| 5 | Enhance | Operational Efficiency | Minimize news summary regeneration (one-time generation principle) |

---

## **3. AI Feature Requirements (MVP)**

1. News Summary Generation
    - Summary based on key paragraphs of the article
    - Exclusion of excessive interpretation/opinion
2. Maintain summary quality
    - Consistent tone & length
    - Change-focused narration

---