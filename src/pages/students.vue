<script setup>
import { supabase } from '@/lib/supaBaseClient'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'

const studentslist = ref([])
const classOptions = ref({})

const fetchClasses = async () => {
  try {
    const { data: classes, error } = await supabase.from('class').select('id, classname')

    if (error) {
      console.error('Error fetching classes:', error)
    } else {
      classOptions.value = classes.reduce((options, cls) => {
        options[cls.id] = cls.classname
        return options
      }, {})
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchstudent = async () => {
  try {
    const teacher_id = localStorage.getItem('teacher_id')
    console.log('Teacher ID: ', teacher_id)
    if (teacher_id) {
      // Fetching students with class names
      const { data: students, error } = await supabase
        .from('students')
        .select(
          `
          id,
          name,
          age,
          class (
            classname
          )
        `,
        )
        .eq('teacher_id', teacher_id)

      console.log('Fetched students with class names: ', students)
      if (error) {
        console.error('Error fetching students: ', error)
      } else if (students) {
        studentslist.value = students
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const addNewstudent = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Add New Student',
    html:
      `<input id="swal-input1" class="swal2-input" placeholder="Name">` +
      `<input id="swal-input3" class="swal2-input" placeholder="Age" type="number">`,
    input: 'select',
    inputOptions: classOptions.value,
    inputPlaceholder: 'Select a class',
    showCancelButton: true,
    preConfirm: () => {
      return [
        document.getElementById('swal-input1').value,
        Swal.getInput().value,
        document.getElementById('swal-input3').value,
      ]
    },
  })

  if (formValues) {
    const [name, classId, age] = formValues
    if (name && classId && age) {
      try {
        const requestData = { name, class: classId, age, teacher_id: localStorage.getItem('teacher_id') }
        const { error } = await supabase.from('students').insert([requestData])
        if (error) {
          throw error
        }

        // Construct the student object for UI update
        const newStudentForUI = {
          name,
          age,
          class: { id: classId, classname: classOptions.value[classId] },
        }

        // Update the UI
        studentslist.value.push(newStudentForUI)

        Swal.fire({
          title: 'Success!',
          text: 'Student successfully added!',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        })
      } catch (error) {
        console.error('Error adding student:', error.message)
        Swal.fire({
          title: 'Error!',
          text: 'Error adding student: ' + error.message,
          icon: 'error',
          confirmButtonColor: '#d33',
        })
      }
    } else {
      Swal.fire({
        title: 'Attention!',
        text: 'Please fill in all fields before submitting.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
      })
    }
  }
}
const editstudent = async student => {
  const { value: formValues } = await Swal.fire({
    title: 'Edit Student Details',
    html:
      `<input id="swal-input1" class="swal2-input" placeholder="Name" value="${student.name}">` +
      `<input id="swal-input3" class="swal2-input" placeholder="Age" type="number" value="${student.age}">`,
    input: 'select',
    inputOptions: classOptions.value,
    inputValue: student.class?.id,
    showCancelButton: true,
    preConfirm: () => {
      return [
        document.getElementById('swal-input1').value,
        Swal.getInput().value,
        document.getElementById('swal-input3').value,
      ]
    },
  })

  if (formValues) {
    const [name, classId, age] = formValues
    try {
      const updatedData = { id: student.id, name, class: classId, age }

      const { error } = await supabase.from('students').upsert([updatedData], { onConflict: 'id' })

      if (error) {
        throw error
      }

      const index = studentslist.value.findIndex(c => c.id === student.id)
      if (index !== -1) {
        const { data: updatedClass, error: classError } = await supabase
          .from('class')
          .select('classname')
          .eq('id', classId)
        if (classError) {
          throw classError
        }
        studentslist.value[index] = {
          ...studentslist.value[index],
          ...updatedData,
          class: { classname: updatedClass[0].classname },
        }
      }

      Swal.fire('Updated!', 'Student updated successfully.', 'success')
    } catch (error) {
      console.error('Error updating student:', error.message)
      Swal.fire('Error!', 'Error updating student: ' + error.message, 'error')
    }
  }
}

const confirmDelete = async student => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this student!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then(async result => {
    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('students').delete().match({ id: student.id })

        if (error) {
          throw error
        }

        studentslist.value = studentslist.value.filter(c => c.id !== student.id)

        Swal.fire('Deleted!', 'Student has been deleted.', 'success')
      } catch (error) {
        console.error('Error deleting student:', error.message)
        Swal.fire('Error!', 'Error deleting student: ' + error.message, 'error')
      }
    }
  })
}

onMounted(() => {
  fetchClasses()
  const teacher_id = localStorage.getItem('teacher_id')
  if (teacher_id) {
    fetchstudent()
  }
})
</script>

<template>
  <VCard title="List of Students">
    <VTable class="text-no-wrap">
      <thead>
        <tr>
          <th
            scope="col"
            class="text-start"
          >
            Student Name
          </th>
          <th
            scope="col"
            class="text-start"
          >
            Class
          </th>
          <th
            scope="col"
            class="text-start"
          >
            Age
          </th>
          <th
            scope="col"
            class="text-center"
          >
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="student in studentslist"
          :key="student.id"
        >
          <td>{{ student.name }}</td>
          <td>{{ student.class?.classname }}</td>
          <td>{{ student.age }}</td>
          <td class="text-center">
            <div class="icon-wrapper">
              <VIcon @click="editstudent(student)">mdi-pencil</VIcon>
              <VIcon @click="confirmDelete(student)">mdi-delete</VIcon>
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDivider />

    <VCardText>
      <div class="d-flex flex-wrap gap-4 mt-4">
        <VBtn @click="addNewstudent">Add student</VBtn>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.text-center {
  text-align: center;
}
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px; /* Adjust the gap between icons as needed */
}
</style>
