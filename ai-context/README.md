# AI Context Documentation

This directory contains comprehensive documentation for AI assistants working on the EasyLotto project. The documentation is organized into logical sections to make it easy for both humans and AI agents to find relevant information quickly.

## 📁 Directory Structure

### 01-project-documentation/
**Core project information and high-level overview**
- `project-overview.md` - Project goals, vision, and educational mission
- `features-and-functionality.md` - Current features and functionality overview

### 02-technical-specifications/
**Technical architecture and implementation details**
- `technical-architecture.md` - System architecture, tech stack, and design patterns
- `database-schema.md` - Database structure, relationships, and data models
- `api-endpoints.md` - API documentation and endpoint specifications
- `data-synchronization.md` - Data sync processes, cron jobs, and automation

### 03-feature-specifications/
**Detailed feature specifications and requirements**
- `mathematical-algorithms.md` - Lottery calculation algorithms and mathematical concepts
- `missing-features.md` - Analysis of features that need to be implemented

### 04-implementation-tasks/
**Task lists and implementation guides for AI agents**
- `implementation-roadmap.md` - Phased implementation plan with timelines
- `missing-features-tasks.md` - Comprehensive task breakdown with technical specs
- `augment-agent-tasks.md` - Specific format for Augment Code agents
- `general-ai-tasks.md` - Simplified prompts for other AI assistants

### 05-educational-content/
**Educational content and domain-specific knowledge**
- `brazilian-lottery-misconceptions.md` - Common misconceptions and educational focus

## 🎯 Quick Start Guide

### For New AI Agents:
1. **Start Here**: Read `01-project-documentation/project-overview.md`
2. **Understand the Tech**: Review `02-technical-specifications/technical-architecture.md`
3. **Know Current Features**: Check `01-project-documentation/features-and-functionality.md`
4. **Find Tasks**: Browse `04-implementation-tasks/` for work to be done

### For Specific Work Types:

#### 🔧 **Technical Implementation**
- Architecture: `02-technical-specifications/technical-architecture.md`
- Database: `02-technical-specifications/database-schema.md`
- APIs: `02-technical-specifications/api-endpoints.md`

#### 📋 **Task Planning**
- Roadmap: `04-implementation-tasks/implementation-roadmap.md`
- Detailed Tasks: `04-implementation-tasks/missing-features-tasks.md`
- Agent-Specific: `04-implementation-tasks/augment-agent-tasks.md`

#### 🎓 **Educational Features**
- Misconceptions: `05-educational-content/brazilian-lottery-misconceptions.md`
- Math Algorithms: `03-feature-specifications/mathematical-algorithms.md`

#### 🚀 **Feature Development**
- Missing Features: `03-feature-specifications/missing-features.md`
- Implementation Tasks: `04-implementation-tasks/`

## 📝 Usage Guidelines

### For AI Assistants:
- **Always start** with the project overview to understand the educational mission
- **Check existing features** before proposing new ones
- **Follow the task format** that matches your capabilities (Augment vs General)
- **Prioritize educational value** in all implementations

### For Human Developers:
- **Update documentation** when making changes
- **Add new tasks** to the appropriate task files
- **Maintain the directory structure** when adding new files

## 🔄 Maintenance

This documentation should be updated whenever:
- ✅ New features are added or removed
- ✅ Architecture changes are made
- ✅ Database schema is modified
- ✅ API endpoints are added, changed, or deprecated
- ✅ Educational content requirements change
- ✅ Task priorities shift

## 📊 Document Relationships

```
project-overview.md
    ↓
technical-architecture.md → database-schema.md
    ↓                           ↓
features-and-functionality.md → api-endpoints.md
    ↓
missing-features.md → implementation-roadmap.md
    ↓                       ↓
brazilian-lottery-misconceptions.md → task files
```

This structure ensures that information flows logically from high-level concepts to specific implementation details.
