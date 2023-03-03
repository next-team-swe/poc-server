 
// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js')


// Create a single supabase client for interacting with your database
const supabase = createClient('https://banraxrzqacvpzsonavh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhbnJheHJ6cWFjdnB6c29uYXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzczMzkzNTksImV4cCI6MTk5MjkxNTM1OX0.gRfvdnzSN_jBTmi2iY1GPOK10flQIp_tUgyeRD3K90I');

// supabase.from('light').select('*').then(console.log)

// supabase
//   .channel('any')
//   .on('postgres_changes', { event: '*', schema: 'public', table: 'light' }, payload => {
//     console.log('Change received!', payload)
//   })
//   .subscribe()


supabase
  .channel('any')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'light'}, payload => {

    //show payload difference
    for (let key in payload.new) {
        if (payload.new[key] != payload.old[key]) {
            console.log(payload.new.name, key, payload.old[key], "changed to", payload.new[key])
        }
    }
  })
  .subscribe()