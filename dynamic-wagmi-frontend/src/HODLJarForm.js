"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  story: z.string().min(10, "Story must be at least 10 characters"),
  age: z.number().min(0).max(18),
  fosterHome: z.string().startsWith("0x", "Must be a valid Ethereum address")
})

export function HODLJarForm({ onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      story: "",
      age: 0,
      fosterHome: "0x"
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col">
        <label htmlFor="name">Child's Name</label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="border rounded p-2"
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="story">Story</label>
        <textarea
          id="story"
          {...register("story")}
          className="border rounded p-2"
          rows={4}
        />
        {errors.story && (
          <span className="text-red-500 text-sm">{errors.story.message}</span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="age">Age</label>
        <input
          id="age"
          type="number"
          {...register("age", { valueAsNumber: true })}
          className="border rounded p-2"
        />
        {errors.age && (
          <span className="text-red-500 text-sm">{errors.age.message}</span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="fosterHome">Foster Home Address</label>
        <input
          id="fosterHome"
          type="text"
          {...register("fosterHome")}
          className="border rounded p-2"
        />
        {errors.fosterHome && (
          <span className="text-red-500 text-sm">{errors.fosterHome.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`bg-blue-500 text-white rounded p-2 ${isSubmitting ? 'opacity-50' : 'hover:bg-blue-600'
          }`}
      >
        {isSubmitting ? 'Confirm in Wallet...' : 'Create HODL Jar'}
      </button>
    </form>
  )
}
