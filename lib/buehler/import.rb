require 'csv'
require 'faraday'

begin
  require 'pry'
rescue LoadError => e
end

class Buehler::Import
  def self.dfk_persons
    @dfk_persons ||= begin
      response = Faraday.get('https://static.dfkg.org/dfk_persons/entities.json')
      data = JSON.parse(response.body)

      lookup = {}
      data['records'].each do |record|
        qid = record['wikidata_id']
        next unless qid

        lookup[qid] = record
      end
      lookup
    end
  end

  def self.run
    csv = CSV.open('data/records.csv',
      headers: true,
      return_headers: false,
      col_sep: '|'
    )

    records = []

    csv.each do |row|
      record = row.to_h.compact

      if dp = dfk_persons[record['Wikidata ID']]
        record['dfk_id'] = dp['dfk_id']
      end

      records << record
    end

    translations = {'de' => {}, 'en' => {}, 'fr' => {}}
    # TODO

    File.open './frontend/public/records.json', 'w' do |f|
      f.write JSON.pretty_generate(records)
    end

    File.open './frontend/public/translations.json', 'w' do |f|
      f.write JSON.pretty_generate(translations)
    end
  end
end