import { useQuery } from '@tanstack/react-query'
import { CourseService } from '../services'
import type { Course, CourseFilters } from '../types'

/**
 * useCourses Hook
 * Fetches and caches courses with optional filtering
 */

export const COURSES_QUERY_KEY = 'courses'

export function useCourses(filters?: CourseFilters, userId?: string) {
  return useQuery({
    queryKey: [COURSES_QUERY_KEY, filters, userId],
    queryFn: () => CourseService.getCourses(filters, userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * useCourse Hook
 * Fetches a single course by ID
 */

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: [COURSES_QUERY_KEY, courseId],
    queryFn: () => CourseService.getCourseById(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * useCourseReservations Hook
 * Fetches reservations for a specific course
 */

export function useCourseReservations(courseId: string) {
  return useQuery({
    queryKey: [COURSES_QUERY_KEY, courseId, 'reservations'],
    queryFn: () => CourseService.getCourseReservations(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * useLocations Hook
 * Fetches unique course locations
 */

export function useLocations() {
  return useQuery({
    queryKey: [COURSES_QUERY_KEY, 'locations'],
    queryFn: () => CourseService.getLocations(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}
