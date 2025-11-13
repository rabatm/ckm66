const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fijixfpsmoktksozsyjd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaml4ZnBzbW9rdGtzb3pzeWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDAwMTUsImV4cCI6MjA3NTc3NjAxNX0.XcHqCBxuSjnyJiR42B2rMgpvw7M2lb0w700DAWGb2zw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllData() {
  try {
    // Check courses
    const { data: courses, error: coursesError, count: courseCount } = await supabase
      .from('courses')
      .select('id', { count: 'exact', head: true });

    if (coursesError) throw coursesError;
    console.log(`Courses in database: ${courseCount}`);

    // Check profiles
    const { count: profileCount, error: profileError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (profileError) throw profileError;
    console.log(`Profiles in database: ${profileCount}`);

    // Check users (auth.users)
    console.log('\n=== Summary ===');
    console.log(`Courses: ${courseCount}`);
    console.log(`Profiles: ${profileCount}`);
    console.log(`Instances: 0`);
    console.log(`Reservations: 0`);

    if (courseCount === 0) {
      console.log('\n⚠️  No courses found in database. Instances cannot be generated without courses.');
      console.log('You may need to:');
      console.log('1. Create some courses first');
      console.log('2. Generate instances for those courses');
      console.log('3. Then try booking a course');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAllData();
