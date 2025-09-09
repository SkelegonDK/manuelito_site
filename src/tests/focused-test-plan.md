# Focused Test Plan - Current Issues & Untested Pages

## Current Test Status Analysis
- **Total Tests**: 197 passed, 148 failed
- **Main Issues**: Mobile navigation class management, blog performance timeouts, viewport height mismatches

## Critical Issues to Fix

### 1. Mobile Navigation Class Management
**Problem**: Mobile menu not getting `menu-open` class consistently
**Symptoms**: 
- Tests expecting `/menu-open/` class failing
- Height calculations using wrong values (587px vs 667px)
- Menu state not properly tracked

**Root Cause**: Likely timing issues with CSS transitions and class application

### 2. Blog Performance Timeouts
**Problem**: Blog tests timing out at 30 seconds
**Symptoms**: 
- `should identify performance bottlenecks` test failing
- Navigation to blog posts hanging

**Root Cause**: Likely image loading or JavaScript execution issues

### 3. Viewport Height Mismatches
**Problem**: Tests expecting specific viewport heights (667px, 100vh) but getting different values
**Symptoms**: 
- Height assertions failing with unexpected values
- Mobile menu height calculations incorrect

## Untested Pages Identified

### 1. Gallery Page (`/gallery`)
- **Status**: No dedicated tests
- **Features**: Dynamic content rendering, responsive grid, image optimization
- **Test Needs**: Content rendering, responsive behavior, image loading

### 2. Courses Index Page (`/courses`)
- **Status**: No dedicated tests  
- **Features**: Course card grid, responsive layout
- **Test Needs**: Grid rendering, responsive behavior, course data display

### 3. About Page (`/about`)
- **Status**: No dedicated tests
- **Features**: Component rendering, content display
- **Test Needs**: Component rendering, content visibility

### 4. Individual Course Pages (`/courses/[slug]`)
- **Status**: No dedicated tests
- **Features**: MDX content rendering, course data display
- **Test Needs**: Content rendering, navigation, course data

### 5. Individual Blog Posts (`/blog/[slug]`)
- **Status**: Limited testing (only in blog performance tests)
- **Features**: MDX rendering, image optimization, navigation
- **Test Needs**: Content rendering, image loading, navigation

## Immediate Action Plan

### Phase 1: Fix Critical Mobile Navigation Issues
1. Investigate why `menu-open` class isn't being applied
2. Fix viewport height calculations
3. Ensure proper CSS class management

### Phase 2: Fix Blog Performance Issues
1. Investigate blog test timeouts
2. Fix image loading issues
3. Optimize blog navigation

### Phase 3: Add Missing Page Tests
1. Create gallery page tests
2. Create courses page tests
3. Create about page tests
4. Create individual course/blog post tests

## Test Priority Order
1. **High Priority**: Fix mobile navigation class issues
2. **Medium Priority**: Fix blog performance timeouts  
3. **Low Priority**: Add missing page tests

## Next Steps
1. Run focused mobile navigation tests to isolate issues
2. Investigate blog performance bottlenecks
3. Create test coverage for untested pages
4. Validate fixes with comprehensive test runs
