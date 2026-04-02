'use client'

import { motion, HTMLMotionProps, Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function MotionDiv(props: HTMLMotionProps<'div'>) {
  return <motion.div {...props} />
}

export function MotionSection(props: HTMLMotionProps<'section'>) {
  return <motion.section {...props} />
}

export function FadeIn(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      {...props}
    />
  )
}

export function FadeInStagger(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      {...props}
    />
  )
}
